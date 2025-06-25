import { Hono } from "https://deno.land/x/hono@v4.3.11/mod.ts";
import { serveStatic } from "https://deno.land/x/hono@v4.3.11/middleware.ts";
import { logger } from "https://deno.land/x/hono@v4.3.11/middleware.ts";
import { todoRoutes } from "./routes/todo.ts";

const app = new Hono();

// Match API routes before static files
app.use(logger());
app.route("/api/todos", todoRoutes);

// Serve static files from /public
app.use("/*", serveStatic({ root: "./public" }));

Deno.serve(app.fetch);
