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

            </div>

            <div class="actions">

                <button
                    class="complete-btn"
                    onclick="toggleTask(${task.id}, '${escapeQuotes(task.title)}', '${escapeQuotes(task.description)}', ${task.completed})"
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

    if (title.trim() === "") {

        alert("Please enter a task title.");

        return;
    }

    const newTask = {

        title: title,

        description: description,

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


    loadTasks();
}


// -------------------------
// Complete / Undo Task
// -------------------------

async function toggleTask(
    id,
    title,
    description,
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


// -------------------------
// Start application
// -------------------------

loadTasks();