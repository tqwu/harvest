import http from "http";
import supertest from "supertest";
import "whatwg-fetch";

import * as db from "../db";
import requestHandler from "./requestHandler";

let server: http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>;
let request: supertest.SuperTest<supertest.Test>;

jest.setTimeout(10000);

beforeAll(async () => {
  server = http.createServer(requestHandler);
  server.listen();
  request = supertest(server);
  await db.reset();
  return new Promise((resolve) => setTimeout(resolve, 500));
});

afterAll((done) => {
  server.close(done);
  db.shutdown();
});

test("Workspace Count", async () => {
  await request
    .post("/api/graphql")
    .send({ query: `query { countWorkspace { count } }` })
    .expect(200)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.data).toBeDefined();
      expect(data.body.data.countWorkspace.count).toBeDefined();
      expect(data.body.data.countWorkspace.count).toEqual(4);
    });
});
