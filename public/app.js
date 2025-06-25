const API_URL = "/api/todos";

async function fetchTodos() {
  const res = await fetch(API_URL);
  const data = await res.json();
  return data.todos;
}

function renderTodos(todos) {
  const list = document.getElementById("todo-list");
  list.innerHTML = "";
  if (todos.length === 0) {
    list.innerHTML = "<p>No todos yet!</p>";
    return;
  }
  todos.forEach((todo) => {
    const div = document.createElement("div");
    div.className = "todo-item";
    div.innerHTML = `
      <span style="${
        todo.done ? "text-decoration:line-through;color:gray;" : ""
      }">${todo.text}</span>
      <span style="margin-left:10px;color:#888;font-size:0.9em;">${
        todo.scheduledAt
          ? `⏰ ${new Date(todo.scheduledAt).toLocaleString()}`
          : ""
      }</span>
      <button data-id="${todo.id}" class="done-btn" ${
      todo.done ? "disabled" : ""
    }>Done</button>
      <button data-id="${todo.id}" class="delete-btn">Delete</button>
    `;
    if (todo.reminder && !todo.done) {
      div.innerHTML += `<span style='color:#e67e22;margin-left:8px;'>🔔 Reminder set</span>`;
    }
    list.appendChild(div);
  });
}

async function refreshTodos() {
  const todos = await fetchTodos();
  renderTodos(todos);
}

document.getElementById("todo-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.getElementById("todo-input");
  const text = input.value.trim();
  if (!text) return;
  // Scheduling and reminder fields
  const scheduledAt = prompt(
    "Schedule for (YYYY-MM-DD HH:mm, leave blank for none):"
  );
  let reminder = false;
  if (scheduledAt) {
    reminder = confirm("Set a reminder for this scheduled todo?");
  }
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        scheduledAt: scheduledAt || null,
        reminder,
      }),
    });
    input.value = "";
    document.getElementById("error-message").textContent = "";
    await refreshTodos();
  } catch (err) {
    document.getElementById("error-message").textContent =
      "Failed to add todo.";
  }
});

document.getElementById("todo-list").addEventListener("click", async (e) => {
  if (e.target.classList.contains("done-btn")) {
    const id = e.target.getAttribute("data-id");
    await fetch(`${API_URL}/${id}/done`, { method: "PATCH" });
    await refreshTodos();
  } else if (e.target.classList.contains("delete-btn")) {
    const id = e.target.getAttribute("data-id");
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    await refreshTodos();
  }
});

refreshTodos();
