import app from "../src/index";
import request from "supertest";
import { createServer, IncomingMessage } from "http";

function nodeRequestToFetchRequest(req: IncomingMessage) {
  const url = `http://${req.headers.host}${req.url}`;
  return new Request(url, {
    method: req.method,
    headers: req.headers as any,
    // body: req (for POST/PUT, not needed for GET)
  });
}

describe("GET /", () => {
  let server: any;
  beforeAll((done) => {
    server = createServer(async (req, res) => {
      const fetchReq = nodeRequestToFetchRequest(req);
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
});
