import { Hono } from "https://deno.land/x/hono/mod.ts";
import { todoRoutes } from "./routes/todo.ts";

const app = new Hono();

app.route("/api/todos", todoRoutes);

app.get("/", (c) => c.text("TODO App Backend Running!"));

Deno.serve(app.fetch);
