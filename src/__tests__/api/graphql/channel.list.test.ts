import * as http from "http";
import supertest from "supertest";
// import 'whatwg-fetch';

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

const personal = "f484042b-6dd1-4fb3-bf44-1331ab15432f";
const empty = "76f8ba91-4b83-4fb3-ac30-736519abb8fa";
const badUUID = "00000000-0000-4000-a000-000000000000";
const invalidUUID = "invalidUUID";

test("GET All - Invalid UUID", async () => {
  await request
    .post("/api/graphql")
    .send({ query: `{channel(wid: "${invalidUUID}") {id}}` })
    .expect("Content-Type", /json/)
    .then((data) => {
      expect(data.body.errors.length).toEqual(1);
    });
});

test("GET All - Non-Existing Workspace", async () => {
  accessToken = await login.asMolly(request);
  await request
    .post("/api/graphql")
    .set("Authorization", "Bearer " + accessToken)
    .send({ query: `{channel(wid: "${badUUID}") {id, name}}` })
    .expect(200)
    .expect("Content-Type", /json/)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.data).toBeDefined();
      expect(data.body.data.channel.length).toEqual(0);
    });
});

test("GET All - Empty Workspace", async () => {
  accessToken = await login.asMolly(request);
  await request
    .post("/api/graphql")
    .set("Authorization", "Bearer " + accessToken)
    .send({ query: `{channel(wid: "${empty}") {id, name}}` })
    .expect(200)
    .expect("Content-Type", /json/)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.data).toBeDefined();
      expect(data.body.data.channel.length).toEqual(0);
    });
});

test("GET All - Personal Workspace", async () => {
  accessToken = await login.asMolly(request);
  await request
    .post("/api/graphql")
    .set("Authorization", "Bearer " + accessToken)
    .send({ query: `{channel(wid: "${personal}") {id, name}}` })
    .expect(200)
    .expect("Content-Type", /json/)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.data).toBeDefined();
      expect(data.body.data.channel.length).toEqual(2);
    });
});
