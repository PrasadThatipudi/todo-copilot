import app from "../src/index";
import request from "supertest";
import { createServer, IncomingMessage } from "http";

function nodeRequestToFetchRequest(req: IncomingMessage) {
  const url = `http://${req.headers.host}${req.url}`;
  return new Promise<Request>((resolve) => {
    let body: Buffer[] = [];
    req.on("data", (chunk) => body.push(chunk));
    req.on("end", () => {
      const fullBody = Buffer.concat(body);
      resolve(
        new Request(url, {
          method: req.method,
          headers: req.headers as any,
          body: fullBody.length > 0 ? fullBody : undefined,
        })
      );
    });
  });
}

describe("TODO API", () => {
  let server: any;
  beforeAll((done) => {
    server = createServer(async (req, res) => {
      const fetchReq = await nodeRequestToFetchRequest(req);
      const response = await app.fetch(fetchReq);
      res.writeHead(
        response.status,
        Object.fromEntries(response.headers.entries())
      );
      const body = await response.text();
      res.end(body);
    });
    server.listen(done);
  });
  afterAll((done) => {
    server.close(done);
  });

  it("should return API running message", async () => {
    const res = await request(server).get("/");
    expect(res.text).toBe("TODO App API is running!");
    expect(res.status).toBe(200);
  });

  it("should create a new todo", async () => {
    const res = await request(server)
      .post("/todos")
      .send({ title: "Test Todo", description: "Test Desc" })
      .set("Content-Type", "application/json");
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Test Todo");
    expect(res.body.status).toBe("undone");
  });

  it("should list all todos", async () => {
    const res = await request(server).get("/todos");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
