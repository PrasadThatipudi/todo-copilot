import { Hono } from "hono";

const app = new Hono();

// In-memory store for todos
let todos: any[] = [];
let idCounter = 1;

// List all todos
app.get("/todos", (c) => c.json(todos));

// Create a new todo
app.post("/todos", async (c) => {
  const { title, description } = await c.req.json();
  const todo = {
    id: idCounter++,
    title,
    description,
    status: "undone",
    deleted: false,
    tasks: [],
  };
  todos.push(todo);
  return c.json(todo, 201);
});

// Add a task to an existing todo
app.post("/todos/:id/tasks", async (c) => {
  const id = Number(c.req.param("id"));
  const { task } = await c.req.json();
  const todo = todos.find((t) => t.id === id && !t.deleted);
  if (!todo) return c.json({ error: "Todo not found" }, 404);
  const taskObj = { id: todo.tasks.length + 1, title: task, status: "undone" };
  todo.tasks.push(taskObj);
  return c.json(taskObj, 201);
});

app.get("/", (c) => c.text("TODO App API is running!"));

export default app;
