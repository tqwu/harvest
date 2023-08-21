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

const mollyWorkspace: string = "f484042b-6dd1-4fb3-bf44-1331ab15432f";
const annaWorkspace: string = "fe7de6c9-2599-479f-97fe-2339d4098d61";
const badUUID: string = "00000000-0000-4000-a000-000000000000";

test("Create New", async () => {
  accessToken = await login.asMolly(request);
  await request
    .post("/api/graphql")
    .set("Authorization", "Bearer " + accessToken)
    .send({
      query: `mutation { createChannel(input: {
        wid: "${mollyWorkspace}",
        name: "Test Channel",
    }) { id, wid, name }}`,
    })
    .expect(200)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.data).toBeDefined();
      expect(data.body.data.createChannel.id).toBeDefined();
      expect(data.body.data.createChannel.wid).toEqual(mollyWorkspace);
      expect(data.body.data.createChannel.name).toEqual("Test Channel");
    });
});

test("GET after create", async () => {
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
      expect(data.body.data.channel.length).toEqual(3);
    });
});

test("Create New - Unauthorized", async () => {
  accessToken = await login.asMolly(request);
  await request
    .post("/api/graphql")
    .set("Authorization", "Bearer " + accessToken)
    .send({
      query: `mutation { createChannel(input: {
        wid: "${annaWorkspace}",
        name: "Test Channel Unauthorized",
    }) { id, wid, name }}`,
    })
    .expect("Content-Type", /json/)
    .then((data) => {
      expect(data.body.errors.length).toEqual(1);
    });
});

test("Create New - Invalid", async () => {
  await request
    .post("/api/graphql")
    .send({
      query: `mutation { createChannel(input: {
        wid: "${badUUID}",
        name: "Test Channel Invalid",
    }) { id, wid, name }}`,
    })
    .expect("Content-Type", /json/)
    .then((data) => {
      expect(data.body.errors.length).toEqual(1);
    });
});
