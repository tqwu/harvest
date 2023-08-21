import supertest from "supertest";
import * as http from "http";

import * as db from "../db";
import * as login from "../login";
import requestHandler from "./requestHandler";

let server: http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>;
let request: supertest.SuperTest<supertest.Test>;
let accessToken: string | undefined;

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

const mollyId: string = "b603abdf-6e15-4e49-a457-c9394867c7cf";

test("Create New", async () => {
  accessToken = await login.asMolly(request);
  await request
    .post("/api/graphql")
    .set("Authorization", "Bearer " + accessToken)
    .send({
      query: `mutation { createWorkspace(input: {
        name: "Test Workspace",
    }) { id, uid, name }}`,
    })
    .expect(200)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.data).toBeDefined();
      expect(data.body.data.createWorkspace.id).toBeDefined();
      expect(data.body.data.createWorkspace.uid).toEqual(mollyId);
      expect(data.body.data.createWorkspace.name).toEqual("Test Workspace");
    });
});

test("GET after create", async () => {
  accessToken = await login.asMolly(request);
  await request
    .post("/api/graphql")
    .set("Authorization", "Bearer " + accessToken)
    .send({ query: "{workspace {id, uid, name}}" })
    .expect(200)
    .expect("Content-Type", /json/)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.data).toBeDefined();
      expect(data.body.data.workspace).toBeDefined();
      expect(data.body.data.workspace.length).toEqual(4);
    });
});

test("Create New - Unauthorized", async () => {
  accessToken = await login.asNobby(request);
  await request
    .post("/api/graphql")
    .set("Authorization", "Bearer " + accessToken)
    .send({
      query: `mutation { createWorkspace(input: {
        name: "Test Workspace Unauthorized",
    }) { id, uid, name }}`,
    })
    .expect("Content-Type", /json/)
    .then((data) => {
      expect(data.body.errors.length).toEqual(1);
    });
});
