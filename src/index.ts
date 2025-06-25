import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => c.text('TODO App API is running!'));

export default app;
