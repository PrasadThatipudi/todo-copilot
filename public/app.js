function getCookie(name) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];
}

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
    div.className = `todo-item ${todo.done ? "done" : "undone"}`;
    div.setAttribute("data-id", todo.id);
    div.style.cursor = "pointer";
    div.innerHTML = `
      <span class="todo-text">${todo.text}</span>
      <span style="margin-left:10px;color:#888;font-size:0.9em;">${
        todo.scheduledAt
          ? `⏰ ${new Date(todo.scheduledAt).toLocaleString()}`
          : ""
      }</span>
      <button data-id="${
        todo.id
      }" class="delete-btn" style="float:right;">Delete</button>
    `;
    // Only show bell if reminder is set and not done and not notified
    if (todo.reminder && !todo.done && todo.id !== globalThis.lastNotifiedId) {
      div.innerHTML += `<span class='reminder-bell' style='color:#e67e22;margin-left:8px;'>🔔</span>`;
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
  const scheduleInput = document.getElementById("todo-schedule");
  const text = input.value.trim();
  const scheduledAt = scheduleInput.value
    ? new Date(scheduleInput.value).toISOString()
    : null;
  // If scheduled, reminder is true; otherwise, false
  const reminder = !!scheduledAt;
  if (!text) return;
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, scheduledAt, reminder }),
    });
    input.value = "";
    scheduleInput.value = "";
    document.getElementById("error-message").textContent = "";
    await refreshTodos();
    // Remove focus from both input and date
    input.blur();
    scheduleInput.blur();
  } catch (_err) {
    document.getElementById("error-message").textContent =
      "Failed to add todo.";
  }
});

document.getElementById("todo-list").addEventListener("click", async (e) => {
  // Delete button
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.getAttribute("data-id");
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    await refreshTodos();
    return;
  }
  // Toggle done/undone by clicking anywhere on the task except delete button
  let target = e.target;
  while (target && !target.classList.contains("todo-item")) {
    target = target.parentElement;
  }
  if (target && target.classList.contains("todo-item")) {
    const id = target.getAttribute("data-id");
    await fetch(`${API_URL}/${id}/toggle`, { method: "PATCH" });
    await refreshTodos();
  }
});

// Notification polling: check for next reminder and show browser notification
let lastNotifiedId = null;
async function pollReminders() {
  if (typeof globalThis === "undefined" || typeof Notification === "undefined")
    return;
  if (Notification.permission !== "granted") {
    await Notification.requestPermission();
  }
  setInterval(async () => {
    try {
      const res = await fetch("/api/todos/next-reminder");
      const { next } = await res.json();
      if (next && next.scheduledAt) {
        const scheduledTime = new Date(next.scheduledAt).getTime();
        const now = Date.now();
        // Only notify if not already notified for this todo
        if (
          Math.abs(scheduledTime - now) <= 30000 &&
          lastNotifiedId !== next.id
        ) {
          if (Notification.permission === "granted") {
            new Notification("TODO Reminder", {
              body: `${next.text} (scheduled for ${new Date(
                next.scheduledAt
              ).toLocaleString()})`,
            });
            lastNotifiedId = next.id;
          }
        }
      }
    } catch (_err) {
      // Ignore polling errors
    }
  }, 10000); // poll every 10 seconds
}

pollReminders();
refreshTodos();
