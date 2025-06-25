async function fetchTodos() {
  const res = await fetch("/todos");
  const todos = await res.json();
  const todosDiv = document.getElementById("todos");
  todosDiv.innerHTML = "";
  todos.forEach((todo) => {
    const todoDiv = document.createElement("div");
    todoDiv.className = "todo";
    todoDiv.innerHTML = `
      <div class="todo-title">${todo.title}</div>
      <div>${todo.description}</div>
      <ul class="tasks">
        ${(todo.tasks || []).map((task) => `<li>${task.title}</li>`).join("")}
      </ul>
      <form class="add-task-form" data-todo-id="${todo.id}">
        <input type="text" placeholder="Add task..." required />
        <button type="submit">Add Task</button>
      </form>
    `;
    todosDiv.appendChild(todoDiv);
  });
  // Add event listeners for all add-task forms
  document.querySelectorAll(".add-task-form").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const todoId = form.getAttribute("data-todo-id");
      const input = form.querySelector("input");
      const task = input.value;
      await fetch(`/todos/${todoId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });
      input.value = "";
      fetchTodos();
    });
  });
}

document.getElementById("todo-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  await fetch("/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description }),
  });
  document.getElementById("title").value = "";
  document.getElementById("description").value = "";
  fetchTodos();
});

document.addEventListener("DOMContentLoaded", fetchTodos);
