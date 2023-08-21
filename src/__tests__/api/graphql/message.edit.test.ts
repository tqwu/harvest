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

const mollyMessage: string = "f8fae3a3-2050-41fc-ab20-85114cb70bc2";
const mollyChannel: string = "5bbc4774-4a9f-4647-bf86-bc65842e1cbb";
const mollyId: string = "b603abdf-6e15-4e49-a457-c9394867c7cf";

test("Edit Authorized", async () => {
  accessToken = await login.asMolly(request);
  await request
    .post("/api/graphql")
    .set("Authorization", "Bearer " + accessToken)
    .send({
      query: `mutation { editMessage (input: {
        id: "${mollyMessage}"
        message: "Updated Message"
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
      expect(data.body.data.editMessage.id).toBeDefined();
      expect(data.body.data.editMessage.cid).toEqual(mollyChannel);
      expect(data.body.data.editMessage.sender).toEqual(mollyId);
      expect(data.body.data.editMessage.message).toEqual("Updated Message");
    });
});

test("Edit Unauthorized", async () => {
  accessToken = await login.asAnna(request);
  await request
    .post("/api/graphql")
    .set("Authorization", "Bearer " + accessToken)
    .send({
      query: `mutation { editMessage (input: {
        id: "${mollyMessage}"
        message: "Unauthorized Updated Message"
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
