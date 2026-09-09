from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI(title="Task Manager API")


# -------------------------
# Data Model
# -------------------------

class Task(BaseModel):
    title: str
    description: str = ""
    due_date: str = ""
    due_time: str = ""
    completed: bool = False


# -------------------------
# Temporary storage
# -------------------------

tasks = [
    #Testing purpose
    # {
    #     "id": 1,
    #     "title": "Learn FastAPI",
    #     "description": "Learn FastAPI basics",
    #     "completed": False
    # },
    # {
    #     "id": 2,
    #     "title": "Build a project",
    #     "description": "Create a simple web application",
    #     "completed": True
    # }
]


# -------------------------
# API Routes
# -------------------------

@app.get("/api/tasks")
def get_tasks():
    return tasks


@app.post("/api/tasks")
def create_task(task: Task):

    new_id = max([task["id"] for task in tasks], default=0) + 1

    new_task = {
        "id": new_id,
        "title": task.title,
        "description": task.description,
        "due_date": task.due_date,
        "due_time": task.due_time,
        "completed": task.completed
    }

    tasks.append(new_task)

    return new_task


@app.put("/api/tasks/{task_id}")
def update_task(task_id: int, task_data: Task):

    for task in tasks:

        if task["id"] == task_id:

            task["title"] = task_data.title
            task["description"] = task_data.description
            task["due_date"] = task_data.due_date
            task["due_time"] = task_data.due_time
            task["completed"] = task_data.completed

            return task

    raise HTTPException(
        status_code=404,
        detail="Task not found"
    )


@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int):

    for task in tasks:

        if task["id"] == task_id:

            tasks.remove(task)

            return {
                "message": "Task deleted successfully"
            }

    raise HTTPException(
        status_code=404,
        detail="Task not found"
    )


# -------------------------
# Serve HTML/CSS/JS
# -------------------------

app.mount(
    "/",
    StaticFiles(directory="static", html=True),
    name="static"
)