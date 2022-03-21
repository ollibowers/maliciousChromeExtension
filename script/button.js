const mainButton = document.getElementById("mainButton");

mainButton.addEventListener("click", buttonEventListener)

async function buttonEventListener() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: printHi
    });
}

function printHi() {
    console.log("hiiii!");
}