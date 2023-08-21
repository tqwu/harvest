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

const mollyWorkspace: string = "f484042b-6dd1-4fb3-bf44-1331ab15432f";
const mollyId: string = "b603abdf-6e15-4e49-a457-c9394867c7cf";
const annaWorkspace: string = "fe7de6c9-2599-479f-97fe-2339d4098d61";

test("Delete Authorized", async () => {
  accessToken = await login.asMolly(request);
  await request
    .post("/api/graphql")
    .set("Authorization", "Bearer " + accessToken)
    .send({
      query: `mutation { deleteWorkspace (input: {
        id: "${mollyWorkspace}"
      }) {
        id, uid, name
      }
    }`,
    })
    .expect(200)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.data).toBeDefined();
      expect(data.body.data.deleteWorkspace.id).toEqual(mollyWorkspace);
      expect(data.body.data.deleteWorkspace.uid).toEqual(mollyId);
      expect(data.body.data.deleteWorkspace.name).toEqual(
        "Molly Personal Workspace",
      );
    });
});

test("GET All workspaces after delete", async () => {
  accessToken = await login.asMolly(request);
  await request
    .post("/api/graphql")
    .set("Authorization", "Bearer " + accessToken)
    .send({ query: "{workspace {id}}" })
    .expect(200)
    .expect("Content-Type", /json/)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.data).toBeDefined();
      expect(data.body.data.workspace.length).toEqual(2);
    });
});

test("GET channels in workspace after delete", async () => {
  accessToken = await login.asMolly(request);
  await request
    .post("/api/graphql")
    .set("Authorization", "Bearer " + accessToken)
    .send({ query: `{channel(wid: "${mollyWorkspace}") {id, name}}` })
    .expect(200)
    .expect("Content-Type", /json/)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.data).toBeDefined();
      expect(data.body.data.channel.length).toEqual(0);
    });
});

test("Delete Unauthorized", async () => {
  accessToken = await login.asMolly(request);
  await request
    .post("/api/graphql")
    .set("Authorization", "Bearer " + accessToken)
    .send({
      query: `mutation { deleteWorkspace (input: {
        id: "${annaWorkspace}"
      }) {
        id, uid, name
      }
    }`,
    })
    .expect("Content-Type", /json/)
    .then((data) => {
      expect(data.body.errors.length).toEqual(1);
    });
});
