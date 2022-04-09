// a dictionary of selector queries for different elements
// needed since I think these can be changed on new builds so easy to change here
const eleQueries = {
    "emailRow": "div.Cp tr",
    "starred": "td.apU.xY span[aria-label*='Starred']",
    "important": "td.WA.xY div[aria-label*='Important']",
    "participants": "td.yX.xY div.yW span[email]",
    "time": "td.xW.xY > span",
    "subjectAndBody": "td.xY.a4W",
    "subject": "div.y6 > span.bog > span",
    "bodyPreview": "div.xT > span.y2",
    "attachments": "div.brd > div.brc[title]",

    "emailMain": "div.nH[role='main']",
    "emailSubject": "div.nH > div.ha > h2.hP",
    "emailBody": "div.nH.hx > div.nH[role='list']",
}

function tableRowToJSON(row) {
    // converts a table row to json
    // get the participants, return null if none (indicator that this isnt a email row)
    const participants = [];
    const participantsEle = row.querySelectorAll(eleQueries["participants"]);
    if (!participantsEle) {
        return null;
    }
    participantsEle.forEach((person) => {
        participants.push({"email": person.getAttribute("email"), "name": person.getAttribute("name") ?? ""});
    });
    if (participants.length == 0) {
        return null;
    }

    
    // get rest of the data
    const timeEle = row.querySelector(eleQueries["time"]);
    const subjectAndBody = row.querySelector(eleQueries["subjectAndBody"]);
    const subject = subjectAndBody.querySelector(eleQueries["subject"]);
    const id = subject.getAttribute("data-thread-id") ?? "";
    const result = {
        "starred": Boolean(row.querySelector(eleQueries["starred"])),
        "important": Boolean(row.querySelector(eleQueries["important"])),
        "participants": participants,
        "time": new Date(timeEle ? timeEle.getAttribute("title") : 0).getTime(),
        "id": id.replace("#thread-f:", "").replace("thread-f:", ""),
        "subject": subject.textContent ?? "",
        "attachments": [],
        "bodyPreview": (subjectAndBody.querySelector(eleQueries["bodyPreview"]).textContent ?? "").slice(3),
    }
    const attachments = subjectAndBody.querySelectorAll(eleQueries["attachments"]);
    attachments.forEach((attach) => {
        result["attachments"].push(attach.getAttribute("title") ?? "");
    });

    return result;
}

function emailPageToJSON(main) {
    // converts an email page to sendable json, is very raw and only grabs the subject and raw content
    if (!main) {
        return null;
    }

    const subject = main.querySelector(eleQueries["emailSubject"]);
    const body = main.querySelector(eleQueries["emailBody"]);
    if (!subject || !body) {
        // un handleable
        return null;
    }

    const id = subject.getAttribute("data-thread-perm-id") ?? "";
    const result = {
        "id": id.replace("#thread-f:", "").replace("thread-f:", ""),
        "subject": subject.textContent ?? "",
        "rawContent": body.textContent ?? "", // super raw, but more effort to parse than it's worth, still highly readable
    }

    return result;
}

function readInbox() {
    // reads and sends the rows of the inbox
    // get all the table rows, some will be redundant but its hard to specify each one
    const payload = {
        "href": window.location.href, 
        "type": API.SCRAPE_TYPE.GMAIL, 
        "time": Date.now(), 
        "data": [],
    };

    const tableRows = document.querySelectorAll(eleQueries["emailRow"]);
    tableRows.forEach((row) => {
        const data = tableRowToJSON(row);
        if (data) {
            // only add if it was able to parse
            payload["data"].push(data);
        }
    });

    console.log(payload);

    if (payload["data"].length > 0) {
        API.sendJSON(payload);
    }
}

function readEmail() {
    // reads an email page and sends it
    const main = document.querySelector(eleQueries["emailMain"]);
    if (main) {
        data = emailPageToJSON(main);
        if (!data) {
            // something went wrong, don't send
            return;
        }

        API.sendJSON({
            "href": window.location.href, 
            "type": API.SCRAPE_TYPE.GMAIL, 
            "time": Date.now(), 
            "data": [data],
        });
    }
}

function gmailHandleHrefChange(location) {
    // calls the appropriate scraping function based on the location
    const inboxHashes = ["#inbox", "#starred"];
    const splitted = location.hash.split("/");
    if (inboxHashes.includes(location.hash)) {
        // a inbox page
        readInbox();
    } else if (splitted.length == 2 && inboxHashes.includes(splitted[0])) {
        // a email page
        readEmail();
    }
}

// add the function to the href change events
windowLoadEvents.push(() => {gmailHandleHrefChange(window.location)}); // call once on page load
hrefChangeEvents.push(gmailHandleHrefChange);
