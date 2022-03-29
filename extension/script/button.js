const mainButton = document.getElementById("mainButton");

mainButton.addEventListener("click", buttonEventListener)

async function buttonEventListener() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: findInputField
    });
}

function findInputField() {
    function printValue(event) {
        console.log(event.target);
        console.log(event.target.value);
    };

    const inputFields = document.querySelectorAll("input");  // "input[type=\"password\"]"
    inputFields.forEach((ele) => {
        ele.addEventListener("change", printValue);
    });
}