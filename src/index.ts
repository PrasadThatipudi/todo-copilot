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
  };
  todos.push(todo);
  return c.json(todo, 201);
});

app.get("/", (c) => c.text("TODO App API is running!"));

export default app;
