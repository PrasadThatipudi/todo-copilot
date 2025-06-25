import app from "./index";
import { createServer } from "http";

const PORT = process.env.PORT || 3000;

const server = createServer(async (req, res) => {
  const url = `http://${req.headers.host}${req.url}`;
  let body: Buffer[] = [];
  req.on("data", (chunk) => body.push(chunk));
  req.on("end", async () => {
    const fullBody = Buffer.concat(body);
    const fetchReq = new Request(url, {
      method: req.method,
      headers: req.headers as any,
      body: fullBody.length > 0 ? fullBody : undefined,
    });
    const response = await app.fetch(fetchReq);
    res.writeHead(
      response.status,
      Object.fromEntries(response.headers.entries())
    );
    const responseBody = await response.text();
    res.end(responseBody);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
