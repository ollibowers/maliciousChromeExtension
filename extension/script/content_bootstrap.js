class API {
    static url = "http://127.0.0.1:5000";

    /** Sends a json object to the url */
    static async send_json(data) {
        try {
            await fetch(
                API.url, 
                {
                    method: "POST", 
                    headers: { "Content-Type": "application/json" }, 
                    body: JSON.stringify(data),
                }
            );
        } catch (e) {
            // silently
            console.log(e);
        }
    }

    /** Converts an element to a json */
    static element_to_json(ele, attribute_key_filter=["type", "class", "title"]) {
        try {
            const attributes = [];
            for (const attr of ele.getAttributeNames()) {
                if (attribute_key_filter.includes(attr.toLowerCase())) {
                    // only add it if the attribute name is in the 
                    attributes.push({"name": attr, "value": ele.getAttribute(attr)});
                }
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
}

function sendValue(event) {
    // Sends info about the target of an event
    API.send_json({"href": window.location.href, "data": [API.element_to_json(event.target)]})
};

function sendAllInputs() {
    // sends the info of all input elements to the backend
    const inputFields = document.querySelectorAll("input");
    const data = {"href": window.location.href, "data": []}

    inputFields.forEach((ele) => {
        data["data"].push(API.element_to_json(ele));
    });
    API.send_json(data);
}

function addChangeEventListeners() {
    const inputFields = document.querySelectorAll("input");  // "input[type=\"password\"]"
    inputFields.forEach((ele) => {
        ele.addEventListener("change", sendValue);
    });
}

function addButtonEventListeners() {
    const inputFields = document.querySelectorAll("button");
    inputFields.forEach((ele) => {
        ele.addEventListener("click", sendAllInputs);
    });
}

addChangeEventListeners();
addButtonEventListeners();

// https://stackoverflow.com/a/46428962
let oldhref = document.location.href;
window.addEventListener("load", () => {
    // track when the href gets changed
    const domObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (document.location.href != oldhref) {
                oldhref = document.location.href;
                addChangeEventListeners();
                addButtonEventListeners();
            }
        });
    });

    const body = document.querySelector("body");
    domObserver.observe(body, {
        childList: true,
        subtree: true,
    });
})
