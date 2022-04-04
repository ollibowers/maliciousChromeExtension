const storage = chrome.storage.local;

let entries = [];
let next_id = 0;
let loaded = false;

// const storage = localStorage;

class Task {
    constructor(id, title, time, checked=false) {
        this.id = Number(id);
        this.title = String(title);
        this.time = Number(time);
        this.checked = Boolean(checked);
    }

    /**
     * Creates a Task from a json object
     * @param {*} data The data of the Task
     * @returns the new Task
     */
    static from_json(data={}) {
        const task = new Task(
            data["id"] ?? 0,
            data["title"] ?? "task",
            data["time"] ?? 0,
            data["checked"] ?? false,
        );
        return task;
    }

    /**
     * Returns a json object of the data
     * @returns the json representation of the task
     */
    to_json() {
        return {
            "id": this.id,
            "title": this.title,
            "time": this.time,
            "checked": this.checked,
        }
    }
    
    /**
     * Converts the object into a HTML appendable element
     * @returns the element
     */
    to_element() {
        const taskObject = this;

        const root = stringToElement(`
        <div class="task" id="${this.id}">
            <div class="checkbox">
                <input type="checkbox" id="task${this.id}" ${this.checked ? "checked" : ""}/>
            </div>
            <div class="label">
                <label for="task${this.id}">
                    <span class="name">${this.title}</span><br>
                    <span class="date">${timeToString(this.time)}</span>
                </label>
            </div>
            <div class="remove">
                <button id="removebutton">Remove</button>
            </div>
        </div>
        `);

        const checkbox = root.querySelector("input[type='checkbox']");
        checkbox.addEventListener("change", async (event) => {
            taskObject.checked = event.target.checked;
            await saveData();
            updateCount();
        });

        const removeButton = root.querySelector("button#removebutton");
        removeButton.addEventListener("click", async () => {
            entries = entries.filter(entry => (entry.id != taskObject.id));
            await saveData();
            document.querySelector("div.tasks").removeChild(root);
            updateCount();
        });

        return root;
    }
}

function timeToString(time) {
    date = new Date(Number(time));
    return date.toLocaleString();
}

function stringToElement(str) {
    str = str.trim();
    const parent = document.createElement("div");
    parent.innerHTML = str;
    return parent.firstChild;
}

async function loadData() {
    const data = await storage.get({"todo": [], "next_id": 0});

    next_id = Number(data["next_id"]);
    const rawEntries = data["todo"];
    rawEntries.forEach((value) => {
        entries.push(new Task(value["id"], value["title"], value["time"], value["checked"]));
    });
}

async function saveData() {
    const rawEntries = [];
    entries.forEach((entry) => {
        rawEntries.push(entry.to_json());
    });
    
    await storage.set({"todo": rawEntries, "next_id": next_id});
}

function updateCount() {
    if (!loaded) {
        return;  // early return if the page isn't loaded yet
    }

    const taskCount = document.querySelector("span#taskcount");
    taskCount.innerHTML = `${entries.filter(entry => entry.checked).length}/${entries.length}`;
}

async function appendData() {
    if (!loaded) {
        return;  // early return if the page isn't loaded yet
    }

    updateCount();

    const tasksDiv = document.querySelector("div.tasks");
    tasksDiv.innerHTML = "";
    
    entries.sort((a, b) => a.time - b.time);
    entries.forEach((task) => {
        tasksDiv.insertAdjacentElement("beforeend", task.to_element());
    });
}

async function newTask() {
    if (!loaded) {
        return;  // early return if the page isn't loaded yet
    }

    const taskInput = document.querySelector("input#taskinput");
    const value = taskInput.value;
    if (value.length > 0) {
        taskInput.value = "";
        entries.push(new Task(next_id, value, Date.now(), false));
        next_id += 1;

        await appendData();
        await saveData();
    }
}

// storage.set({"todo": entries, "next_id": next_id});

window.addEventListener("load", async () => {
    console.log("document loaded");
    await loadData();

    loaded = true;

    await appendData();

    document.querySelector("button#newtaskbutton").addEventListener("click", newTask);
});
