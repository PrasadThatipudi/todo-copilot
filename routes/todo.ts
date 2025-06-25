import { Hono } from "https://deno.land/x/hono@v4.3.11/mod.ts";

// In-memory store for todos
let todos: Array<{
  id: number;
  text: string;
  done: boolean;
  scheduledAt?: string | null;
  reminder?: boolean;
}> = [];
let nextId = 1;

export const todoRoutes = new Hono();

// For testing: reset state
if (Deno.env.get("DENO_ENV") === "test") {
  todoRoutes.post("/test/reset", async (c) => {
    todos = [];
    nextId = 1;
    return c.json({ success: true });
  });
}

// Get all todos
todoRoutes.get("/", (c) => c.json({ todos }));

// Add a new todo
// POST /api/todos { text: string, scheduledAt?: string, reminder?: boolean }
todoRoutes.post("/", async (c) => {
  const { text, scheduledAt, reminder } = await c.req.json();
  const todo = {
    id: nextId++,
    text,
    done: false,
    scheduledAt: scheduledAt || null,
    reminder: !!reminder,
  };
  todos.push(todo);
  return c.json(todo, 201);
});

// Mark todo as done
// PATCH /api/todos/:id/done
todoRoutes.patch(":id/done", (c) => {
  const id = Number(c.req.param("id"));
  const todo = todos.find((t) => t.id === id);
  if (!todo) return c.json({ error: "Not found" }, 404);
  todo.done = true;
  return c.json(todo);
});

// Delete a todo
// DELETE /api/todos/:id
todoRoutes.delete(":id", (c) => {
  const id = Number(c.req.param("id"));
  todos = todos.filter((t) => t.id !== id);
  return c.json({ success: true });
});

// (Optional) Endpoint to get todos with reminders due soon (for future notification logic)
todoRoutes.get("/reminders/due", (c) => {
  const now = new Date();
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
  const now = new Date();
  // Find the next reminder that is due or overdue and not done
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
