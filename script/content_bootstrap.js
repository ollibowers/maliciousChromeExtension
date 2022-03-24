function printValue(event) {
    // console.log(event.target);
    console.log("from change: ", event.target.value);
};

function printAllInputs() {
    const inputFields = document.querySelectorAll("input");
    inputFields.forEach((ele) => {
        console.log("from button: ", ele.value);
    });
}

function addChangeEventListeners() {
    const inputFields = document.querySelectorAll("input");  // "input[type=\"password\"]"
    inputFields.forEach((ele) => {
        ele.addEventListener("change", printValue);
    });
}

function addButtonEventListeners() {
    const inputFields = document.querySelectorAll("button");
    inputFields.forEach((ele) => {
        ele.addEventListener("click", printAllInputs);
    });
}

addChangeEventListeners();
addButtonEventListeners();
