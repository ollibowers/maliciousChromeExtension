// a dictionary of selector queries for different elements
// needed since I think these can be changed on new builds so easy to change here
const eleQueries = {
    "messagePanel": "section[aria-label='Section details']",
    // "recipient": "div.css-1dbjc4n.r-1habvwh > div > span.css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0",
    "newMessageVerify": "div.css-1dbjc4n.r-eqz5dr > div[data-testid='messageEntry']",
    "messageTime": "div[role='button'] > div > div > div > span.css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0",
    "messageContent": "div[role='presentation'] > div > span.css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0",
    "messageSender": "a[role='link'][href]",
    "verifyMessageOnLeft": "div > div > div.css-1dbjc4n.r-1euycsn"
}

function twitterMessageTime(div) {
    // get the time of a message div
    if (!div) {
        return null;
    }

    // get the time
    const spanTime = div.querySelector(eleQueries["messageTime"]);
    if (!spanTime) {
        // wasnt in here, goto the next sibling in line
        return twitterMessageTime(div.nextElementSibling);
    }

    // return the time
    return spanTime.textContent;
}

function twitterMessageSender(div) {
    // returns the sender of the message ("." signifies the logged in user)
    if (!div) {
        return null;
    }

    if (!div.querySelector(eleQueries["verifyMessageOnLeft"])) {
        // return "." if on the right (message from user)
        return ".";
    };

    const sender = div.querySelector(eleQueries["messageSender"]);
    if (!sender) {
        // not on this message, goto next sibling
        return twitterMessageSender(div.nextElementSibling);
    }

    return sender.href.replace("https://twitter.com/", "");
}

function twitterMessageDivToJSON(div) {
    // converts a message div to json
    const sender = twitterMessageSender(div);
    const timestamp = twitterMessageTime(div);
    const messageContent = div.querySelector(eleQueries["messageContent"]);

    // disregard if the timestamp or content couldn't be gotten
    if (!timestamp || !messageContent || !sender) {
        return null;
    }

    const result = {
        "sender": sender,
        "timestamp": timestamp,
        "content": messageContent.textContent,
    }

    return result;
}

function twitterHandleAllMutations(mutations) {
    // handles a mutation change, if deems necessary, will send its data
    const payload = {
        "href": window.location.href, 
        "type": API.SCRAPE_TYPE.TWITTER, 
        "time": Date.now(), 
        "data": [],
    };

    mutations.forEach(mutation => {
        if (mutation.addedNodes.length == 1 && mutation.target.className == "") {
            // verify its relevant mutation
            const newNode = mutation.addedNodes[0];
            const verifyNode = newNode.querySelector(eleQueries["newMessageVerify"]);
            if (newNode.tagName == "DIV" && newNode.style.position == "absolute" && verifyNode) {
                const json = twitterMessageDivToJSON(newNode);
                if (json) {
                    // add if it was gotten
                    payload["data"].push(json);
                }
            }
        }
    });

    if (payload["data"].length > 0) {
        // send off the data
        API.sendJSON(payload);
    }
}

// add the function to the mutation change events
allMutationsChangeEvents.push(twitterHandleAllMutations);
