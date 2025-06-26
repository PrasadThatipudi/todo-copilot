import { Context, Hono } from "https://deno.land/x/hono@v4.3.11/mod.ts";

// In-memory store for todos per user
interface Todo {
  id: number;
  text: string;
  done: boolean;
  scheduledAt?: string | null;
  reminder?: boolean;
}
const userTodos: Record<string, Todo[]> = {};
let nextId = 1;

function getUsernameFromCookie(c: Context): string | null {
  const cookie = c.req.header("cookie") || "";
  const match = cookie.match(/(?:^|; )todo-username=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export const todoRoutes = new Hono();

// For testing: reset state
if (Deno.env.get("DENO_ENV") === "test") {
  todoRoutes.post("/test/reset", (c) => {
    Object.keys(userTodos).forEach((k) => delete userTodos[k]);
    nextId = 1;
    return c.json({ success: true });
  });
}

// Get all todos for user
todoRoutes.get("/", (c) => {
  const username = getUsernameFromCookie(c);
  if (!username) return c.json({ error: "Unauthorized" }, 401);
  const todos = userTodos[username] || [];
  return c.json({ todos });
});

// Add a new todo for user
// POST /api/todos { text: string, scheduledAt?: string, reminder?: boolean }
todoRoutes.post("/", async (c) => {
  const username = getUsernameFromCookie(c);
  if (!username) return c.json({ error: "Unauthorized" }, 401);
  const { text, scheduledAt, reminder } = await c.req.json();
  const todo = {
    id: nextId++,
    text,
    done: false,
    scheduledAt: scheduledAt || null,
    reminder: !!reminder,
  };
  if (!userTodos[username]) userTodos[username] = [];
  userTodos[username].push(todo);
  return c.json(todo, 201);
});

// Mark todo as done for user
// PATCH /api/todos/:id/done
todoRoutes.patch(":id/done", (c) => {
  const username = getUsernameFromCookie(c);
  if (!username) return c.json({ error: "Unauthorized" }, 401);
  const todos = userTodos[username] || [];
  const id = Number(c.req.param("id"));
  const todo = todos.find((t) => t.id === id);
  if (!todo) return c.json({ error: "Not found" }, 404);
  todo.done = true;
  return c.json(todo);
});

// Toggle todo done/undone for user
// PATCH /api/todos/:id/toggle
todoRoutes.patch(":id/toggle", (c) => {
  const username = getUsernameFromCookie(c);
  if (!username) return c.json({ error: "Unauthorized" }, 401);
  const todos = userTodos[username] || [];
  const id = Number(c.req.param("id"));
  const todo = todos.find((t) => t.id === id);
  if (!todo) return c.json({ error: "Not found" }, 404);
  todo.done = !todo.done;
  return c.json(todo);
});

// Delete a todo for user
// DELETE /api/todos/:id
todoRoutes.delete(":id", (c) => {
  const username = getUsernameFromCookie(c);
  if (!username) return c.json({ error: "Unauthorized" }, 401);
  let todos = userTodos[username] || [];
  const id = Number(c.req.param("id"));
  todos = todos.filter((t) => t.id !== id);
  userTodos[username] = todos;
  return c.json({ success: true });
});

// Reminders due soon for user
// GET /api/todos/reminders/due
todoRoutes.get("/reminders/due", (c) => {
  const username = getUsernameFromCookie(c);
  if (!username) return c.json({ error: "Unauthorized" }, 401);
  const now = new Date();
  const todos = userTodos[username] || [];
  const due = todos.filter(
    (t) =>
      t.reminder && t.scheduledAt && !t.done && new Date(t.scheduledAt) <= now
  );
  return c.json({ due });
});

// --- Notification polling endpoint for frontend ---
// Returns the next due reminder (if any) for the current user
// GET /api/todos/next-reminder
// This is a simple demo; in a real app, use user/session info

todoRoutes.get("/next-reminder", (c) => {
  const username = getUsernameFromCookie(c);
  if (!username) return c.json({ error: "Unauthorized" }, 401);
  const now = new Date();
  const todos = userTodos[username] || [];
  const next = todos
    .filter(
      (t) =>
        t.reminder &&
        t.scheduledAt &&
        !t.done &&
        new Date(t.scheduledAt) <= now &&
        new Date(t.scheduledAt) > new Date(now.getTime() - 60000)
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime()
    )[0];
  return c.json({ next });
});
