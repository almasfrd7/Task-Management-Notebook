const API_URL = "/api/tasks";


// -------------------------
// Load Tasks
// -------------------------

async function loadTasks() {

    const response = await fetch(API_URL);

    const tasks = await response.json();

    displayTasks(tasks);
}


// -------------------------
// Display Tasks
// -------------------------

function displayTasks(tasks) {

    const taskList = document.getElementById("taskList");

    taskList.innerHTML = "";

    tasks.forEach(task => {

        const taskElement = document.createElement("div");

        taskElement.className = "task";

        taskElement.innerHTML = `
            <div class="task-info">

                <h3 class="${task.completed ? "completed" : ""}">
                    ${task.title}
                </h3>

                <p>
                    ${task.description}
                </p>

                ${formatSchedule(task.due_date, task.due_time)}

            </div>

            <div class="actions">

                <button
                    class="complete-btn"
                    onclick="toggleTask(${task.id}, '${escapeQuotes(task.title)}', '${escapeQuotes(task.description)}', '${escapeQuotes(task.due_date || "")}', '${escapeQuotes(task.due_time || "")}', ${task.completed})"
                >
                    ${task.completed ? "Undo" : "Complete"}
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteTask(${task.id})"
                >
                    Delete
                </button>

            </div>
        `;

        taskList.appendChild(taskElement);
    });
}


// -------------------------
// Add Task
// -------------------------

async function addTask() {

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const dueDate = document.getElementById("dueDate").value;
    const dueTime = document.getElementById("dueTime").value;

    if (title.trim() === "") {

        alert("Please enter a task title.");

        return;
    }

    const newTask = {

        title: title,

        description: description,

        due_date: dueDate,

        due_time: dueTime,

        completed: false
    };


    await fetch(API_URL, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(newTask)
    });


    document.getElementById("title").value = "";

    document.getElementById("description").value = "";
    document.getElementById("dueDate").value = "";
    document.getElementById("dueTime").value = "";


    loadTasks();
}


// -------------------------
// Complete / Undo Task
// -------------------------

async function toggleTask(
    id,
    title,
    description,
    dueDate,
    dueTime,
    completed
) {

    await fetch(`${API_URL}/${id}`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            title: title,

            description: description,

            due_date: dueDate,

            due_time: dueTime,

            completed: !completed
        })
    });


    loadTasks();
}


// -------------------------
// Delete Task
// -------------------------

async function deleteTask(id) {

    await fetch(`${API_URL}/${id}`, {

        method: "DELETE"
    });


    loadTasks();
}


// -------------------------
// Escape quotes
// -------------------------

function escapeQuotes(text) {

    return text
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"');
}


function formatSchedule(date, time) {

    if (!date && !time) {
        return "";
    }

    const dateText = date
        ? new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric"
        })
        : "No date";

    const timeText = time
        ? new Date(`1970-01-01T${time}`).toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit"
        })
        : "Any time";

    return `<span class="schedule">${dateText} · ${timeText}</span>`;
}


// -------------------------
// Start application
// -------------------------

loadTasks();