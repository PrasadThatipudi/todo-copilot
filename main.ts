import { Hono } from "https://deno.land/x/hono/mod.ts";
import { serveStatic } from "https://deno.land/x/hono/middleware.ts";
import { todoRoutes } from "./routes/todo.ts";

const app = new Hono();

// Serve static files from /public
app.use("/*", serveStatic({ root: "./public" }));

app.route("/api/todos", todoRoutes);

app.get("/", (c) => c.text("TODO App Backend Running!"));

Deno.serve(app.fetch);
