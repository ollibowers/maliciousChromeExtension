const storage = chrome.storage.local;
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
            "title": this.task,
            "time": this.time,
            "checked": this.checked,
        }
    }
    
    /**
     * Converts the object into a HTML appendable string
     * @returns A string representing the element
     */
    to_html() {
        return `
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
                <button>Remove</button>
            </div>
        </div>
        `;
    }
}

function timeToString(time) {
    date = new Date(Number(time));
    return date.toLocaleString();
}

let entries = [];
let next_id = 0;

async function loadData() {
    const data = await storage.get({"todo": "[]", "next_id": "0"});

    console.log(data);

    next_id = Number(data["next_id"]);
    const rawEntries = data["todo"];
    rawEntries.forEach((value) => {
        entries.push(new Task(value["id"], value["title"], value["time"], value["checked"]));
    });
}

async function appendData() {
    entries.sort((a, b) => a.time - b.time);
    const tasksDiv = document.querySelector("div.tasks");

    entries.forEach((task) => {
        tasksDiv.insertAdjacentHTML("beforeend", task.to_html());
    })
}

// storage.set({"todo": entries, "next_id": next_id});

window.addEventListener("load", async () => {
    console.log("document loaded");
    await loadData();
    await appendData();
});
