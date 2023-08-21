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

// Molly's message in Molly's workspace
const mollyMessageOwned: string = "f8fae3a3-2050-41fc-ab20-85114cb70bc2";
const mollyChannel: string = "5bbc4774-4a9f-4647-bf86-bc65842e1cbb";

// Anna's message in Molly's workspace
const annaMessageAccessible: string = "79f2e35a-adb8-4e0c-9107-f313771ab343";

// Molly's message in Anna's workspace
const mollyMessageAccessible: string = "63ff55b5-b7bf-446a-ace9-5c429fd32324";
const annaChannel: string = "0f9cb35b-35f5-4dbd-9a78-c319cba84461";

// Anna's message in Anna's workspace
const annaMessageOwned: string = "773e7346-e4fb-46ac-843f-22d2107e83aa";

const mollyId: string = "b603abdf-6e15-4e49-a457-c9394867c7cf";
const annaId: string = "4ae66869-e58a-4f36-8a77-e30b3ea1bd35";

// Molly deleting a message sent by Molly, in Molly's Workspace
test("Delete Authorized - Message Sender in Owned Workspace", async () => {
  accessToken = await login.asMolly(request);
  await request
    .post("/api/graphql")
    .set("Authorization", "Bearer " + accessToken)
    .send({
      query: `mutation { deleteMessage (input: {
        id: "${mollyMessageOwned}"
      }) {
        id, cid, sender, message
      }
    }`,
    })
    .expect(200)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.data).toBeDefined();
      expect(data.body.data.deleteMessage.id).toBeDefined();
      expect(data.body.data.deleteMessage.cid).toEqual(mollyChannel);
      expect(data.body.data.deleteMessage.sender).toEqual(mollyId);
      expect(data.body.data.deleteMessage.message).toEqual("Hi everyone!");
    });
});

test("GET after delete", async () => {
  accessToken = await login.asMolly(request);
  await request
    .post("/api/graphql")
    .set("Authorization", "Bearer " + accessToken)
    .send({ query: `{message(cid: "${mollyChannel}") {id, sender, message}}` })
    .expect(200)
    .expect("Content-Type", /json/)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.data).toBeDefined();
      expect(data.body.data.message.length).toEqual(1);
    });
});

// Molly deleting a message sent by Molly, in Anna's Workspace
test("Delete Authorized - Message Sender in Accessible Workspace", async () => {
  accessToken = await login.asMolly(request);
  await request
    .post("/api/graphql")
    .set("Authorization", "Bearer " + accessToken)
    .send({
      query: `mutation { deleteMessage (input: {
        id: "${mollyMessageAccessible}"
      }) {
        id, cid, sender, message
      }
    }`,
    })
    .expect(200)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.data).toBeDefined();
      expect(data.body.data.deleteMessage.id).toBeDefined();
      expect(data.body.data.deleteMessage.cid).toEqual(annaChannel);
      expect(data.body.data.deleteMessage.sender).toEqual(mollyId);
      expect(data.body.data.deleteMessage.message).toEqual("Ca va?");
    });
});

test("GET after delete", async () => {
  accessToken = await login.asMolly(request);
  await request
    .post("/api/graphql")
    .set("Authorization", "Bearer " + accessToken)
    .send({ query: `{message(cid: "${annaChannel}") {id, sender, message}}` })
    .expect(200)
    .expect("Content-Type", /json/)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.data).toBeDefined();
      expect(data.body.data.message.length).toEqual(1);
    });
});

// Molly deleting a message sent by Anna, in Molly's Workspace
test("Delete Authorized - Workspace Owner", async () => {
  accessToken = await login.asMolly(request);
  await request
    .post("/api/graphql")
    .set("Authorization", "Bearer " + accessToken)
    .send({
      query: `mutation { deleteMessage (input: {
        id: "${annaMessageAccessible}"
      }) {
        id, cid, sender, message
      }
    }`,
    })
    .expect(200)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.data).toBeDefined();
      expect(data.body.data.deleteMessage.id).toBeDefined();
      expect(data.body.data.deleteMessage.cid).toEqual(mollyChannel);
      expect(data.body.data.deleteMessage.sender).toEqual(annaId);
      expect(data.body.data.deleteMessage.message).toEqual("How are you?");
    });
});

test("GET after delete", async () => {
  accessToken = await login.asMolly(request);
  await request
    .post("/api/graphql")
    .set("Authorization", "Bearer " + accessToken)
    .send({ query: `{message(cid: "${mollyChannel}") {id, sender, message}}` })
    .expect(200)
    .expect("Content-Type", /json/)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.data).toBeDefined();
      expect(data.body.data.message.length).toEqual(0);
    });
});

// Molly deleting a message sent by Anna, in Anna's Workspace
test("Delete Unauthorized", async () => {
  accessToken = await login.asMolly(request);
  await request
    .post("/api/graphql")
    .set("Authorization", "Bearer " + accessToken)
    .send({
      query: `mutation { deleteMessage (input: {
        id: "${annaMessageOwned}"
      }) {
        id, cid, sender, message
      }
    }`,
    })
    .expect("Content-Type", /json/)
    .then((data) => {
      expect(data.body.errors.length).toEqual(1);
    });
});
