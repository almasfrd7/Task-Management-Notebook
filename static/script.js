const API_URL = "/api/tasks";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


// -------------------------
// Motivation sticky note
// -------------------------

const MOTIVATION_WORDS = [
    "Keep going.",
    "Small steps count.",
    "You've got this.",
    "Progress, not perfection.",
    "One task at a time.",
    "Future you says thanks.",
    "Momentum matters.",
    "Done is better than perfect.",
    "Start messy, finish proud.",
    "Today counts too."
];

function startMotivationRotator() {

    const el = document.getElementById("motivationText");

    if (!el) return;

    let index = Math.floor(Math.random() * MOTIVATION_WORDS.length);

    el.textContent = MOTIVATION_WORDS[index];

    if (prefersReducedMotion) return;

    setInterval(() => {

        el.classList.add("is-swapping");

        setTimeout(() => {

            index = (index + 1) % MOTIVATION_WORDS.length;

            el.textContent = MOTIVATION_WORDS[index];

            el.classList.remove("is-swapping");

        }, 350);

    }, 4200);
}


// -------------------------
// Load Tasks
// -------------------------

async function loadTasks() {

    const response = await fetch(API_URL);

    const tasks = await response.json();

    displayTasks(tasks);

    updateSummary(tasks);
}


// -------------------------
// Task count summary
// -------------------------

function updateSummary(tasks) {

    const summary = document.getElementById("taskSummary");

    if (!summary) return;

    if (tasks.length === 0) {
        summary.textContent = "";
        return;
    }

    const done = tasks.filter(t => t.completed).length;
    const open = tasks.length - done;

    summary.textContent = `${open} open · ${done} done`;
}


// -------------------------
// Display Tasks
// -------------------------

function displayTasks(tasks) {

    const taskList = document.getElementById("taskList");

    taskList.innerHTML = "";

    tasks.forEach((task, i) => {

        const taskElement = document.createElement("div");

        taskElement.className = "task";
        taskElement.dataset.id = task.id;

        taskElement.innerHTML = `
            <div class="task-info">

                <h3 class="${task.completed ? "completed" : ""}">
                    ${escapeHtml(task.title)}
                </h3>

                <p>
                    ${escapeHtml(task.description)}
                </p>

                ${formatSchedule(task.due_date, task.due_time)}

            </div>

            <div class="actions">

                <button
                    class="complete-btn"
                    onclick="toggleTask(event, ${task.id}, '${escapeQuotes(task.title)}', '${escapeQuotes(task.description)}', '${escapeQuotes(task.due_date || "")}', '${escapeQuotes(task.due_time || "")}', ${task.completed})"
                >
                    ${task.completed ? "Undo" : "Complete"}
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteTask(event, ${task.id})"
                >
                    Delete
                </button>

            </div>
        `;

        taskList.appendChild(taskElement);

        // Staggered entrance animation
        const delay = prefersReducedMotion ? 0 : i * 45;

        requestAnimationFrame(() => {

            setTimeout(() => {
                taskElement.classList.add("is-visible");
            }, delay);
        });
    });
}


// -------------------------
// Add Task
// -------------------------

async function addTask() {

    const titleInput = document.getElementById("title");
    const descriptionInput = document.getElementById("description");
    const dueDateInput = document.getElementById("dueDate");
    const dueTimeInput = document.getElementById("dueTime");
    const addBtn = document.getElementById("addBtn");

    const title = titleInput.value;
    const description = descriptionInput.value;
    const dueDate = dueDateInput.value;
    const dueTime = dueTimeInput.value;

    if (title.trim() === "") {

        titleInput.focus();

        titleInput.style.borderColor = "var(--danger)";

        setTimeout(() => { titleInput.style.borderColor = ""; }, 900);

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


    titleInput.value = "";
    descriptionInput.value = "";
    dueDateInput.value = "";
    dueTimeInput.value = "";

    titleInput.focus();

    if (!prefersReducedMotion) {

        addBtn.classList.remove("is-confirmed");

        void addBtn.offsetWidth; // restart animation

        addBtn.classList.add("is-confirmed");
    }

    loadTasks();
}


// -------------------------
// Complete / Undo Task
// -------------------------

async function toggleTask(
    event,
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

async function deleteTask(event, id) {

    const taskEl = event.target.closest(".task");

    if (taskEl && !prefersReducedMotion) {

        taskEl.classList.add("is-leaving");

        await new Promise(resolve => setTimeout(resolve, 260));
    }

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
// Escape HTML
// -------------------------

function escapeHtml(text) {

    const div = document.createElement("div");

    div.textContent = text || "";

    return div.innerHTML;
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

startMotivationRotator();
loadTasks();