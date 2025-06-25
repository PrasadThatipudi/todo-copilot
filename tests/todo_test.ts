import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { Hono } from "https://deno.land/x/hono/mod.ts";
import { todoRoutes } from "../routes/todo.ts";

function createApp() {
  const app = new Hono();
  app.route("/api/todos", todoRoutes);
  return app;
}

async function resetTodos(app: Hono) {
  await app.request("/api/todos/test/reset", { method: "POST" });
}

Deno.test("GET /api/todos returns empty list initially", async () => {
  const app = createApp();
  await resetTodos(app);
  const res = await app.request("/api/todos");
  const data = await res.json();
  assertEquals(data.todos, []);
});

Deno.test("POST /api/todos adds a todo", async () => {
  const app = createApp();
  await resetTodos(app);
  const res = await app.request("/api/todos", {
    method: "POST",
    body: JSON.stringify({ text: "Test todo" }),
    headers: { "Content-Type": "application/json" },
  });
  const todo = await res.json();
  assertEquals(todo.text, "Test todo");
  assertEquals(todo.done, false);
  // Check that the todo is in the list
  const listRes = await app.request("/api/todos");
  const listData = await listRes.json();
  assertEquals(listData.todos.length, 1);
  assertEquals(listData.todos[0].text, "Test todo");
});

Deno.test("PATCH /api/todos/:id/done marks todo as done", async () => {
  const app = createApp();
  await resetTodos(app);
  // Add a todo first
  const addRes = await app.request("/api/todos", {
    method: "POST",
    body: JSON.stringify({ text: "Mark done" }),
    headers: { "Content-Type": "application/json" },
  });
  const todo = await addRes.json();
  // Mark as done
  const doneRes = await app.request(`/api/todos/${todo.id}/done`, {
    method: "PATCH",
  });
  const updated = await doneRes.json();
  assertEquals(updated.done, true);
  // Check that the todo is marked as done in the list
  const listRes = await app.request("/api/todos");
  const listData = await listRes.json();
  assertEquals(listData.todos[0].done, true);
});

Deno.test("DELETE /api/todos/:id deletes a todo", async () => {
  const app = createApp();
  await resetTodos(app);
  // Add a todo first
  const addRes = await app.request("/api/todos", {
    method: "POST",
    body: JSON.stringify({ text: "Delete me" }),
    headers: { "Content-Type": "application/json" },
  });
  const todo = await addRes.json();
  // Delete
  const delRes = await app.request(`/api/todos/${todo.id}`, {
    method: "DELETE",
  });
  const delResult = await delRes.json();
  assertEquals(delResult.success, true);
  // Check that the todo is removed from the list
  const listRes = await app.request("/api/todos");
  const listData = await listRes.json();
  assertEquals(listData.todos.length, 0);
});

Deno.test(
  "PATCH /api/todos/:id/done returns 404 for missing todo",
  async () => {
    const app = createApp();
    await resetTodos(app);
    const res = await app.request("/api/todos/999/done", { method: "PATCH" });
    assertEquals(res.status, 404);
    const data = await res.json();
    assertEquals(data.error, "Not found");
  }
);

Deno.test(
  "DELETE /api/todos/:id returns success even if todo does not exist",
  async () => {
    const app = createApp();
    await resetTodos(app);
    const res = await app.request("/api/todos/999", { method: "DELETE" });
    assertEquals(res.status, 200);
    const data = await res.json();
    assertEquals(data.success, true);
  }
);
