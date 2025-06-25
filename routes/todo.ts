import { Hono } from "https://deno.land/x/hono/mod.ts";

// In-memory store for todos
let todos: Array<{ id: number; text: string; done: boolean }> = [];
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
// POST /api/todos { text: string }
todoRoutes.post("/", async (c) => {
  const { text } = await c.req.json();
  const todo = { id: nextId++, text, done: false };
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
