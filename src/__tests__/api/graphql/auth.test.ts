import http from "http";
import supertest from "supertest";
import "whatwg-fetch";

import * as db from "../db";
import * as login from "../login";
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
  db.reset();
  return new Promise((resolve) => setTimeout(resolve, 500));
});

afterAll((done) => {
  server.close(done);
  db.shutdown();
});

const bad = {
  email: "molly_at_books.com",
  password: "mollymember",
};

const wrongEmail = {
  email: "molly@notbooks.com",
    password: "mollymember",
};

const wrongPassword = {
       email: "molly@books.com",
  password: "notmollyspasswd",
};

test("OK", async () => {
    const member = login.molly
  await request
    .post("/api/graphql")
    .send({
      query: `{login(email: "${member.email}" password: 
      "${member.password}") { name, accessToken }}`,
    })
    .expect(200)
    .then((res) => {
      expect(res).toBeDefined();
      expect(res.body).toBeDefined();
      expect(res.body.data.login.name).toEqual("Molly Member");
      expect(res.body.data.login.accessToken).toBeDefined();
    });
});

test("Wrong Credentials - Email", async () => {
  const member = wrongEmail;
  await request
    .post("/api/graphql")
    .send({
      query: `{login(email: "${member.email}" password: 
      "${member.password}") { name, accessToken }}`,
    })
    .expect("Content-Type", /json/)
    .then((data) => {
      expect(data.body.errors.length).toEqual(1);
    });
});

test("Wrong Credentials - Password", async () => {
  const member = wrongPassword;
  await request
    .post("/api/graphql")
    .send({
      query: `{login(email: "${member.email}" password: 
      "${member.password}") { name, accessToken }}`,
    })
    .expect("Content-Type", /json/)
    .then((data) => {
      expect(data.body.errors.length).toEqual(1);
    });
});

test("Bad Format", async () => {
  const member = bad;
  await request
    .post("/api/graphql")
    .send({
      query: `{login(email: "${member.email}" password: 
      "${member.password}") { name, accessToken }}`,
    })
    .expect("Content-Type", /json/)
    .then((data) => {
      expect(data.body.errors.length).toEqual(1);
    });
});

test("Corrupt JWT", async () => {
  await request
    .post("/api/graphql")
    .set("Authorization", "Bearer so-not-a-jwt")
    .send({ query: "{workspace {id}}" })
    .expect("Content-Type", /json/)
    .then((data) => {
      expect(data.body.errors.length).toEqual(1);
    });
});

test("No roles", async () => {
  const accessToken = await login.asNobby(request);
  await request
    .post("/api/graphql")
    .set("Authorization", "Bearer " + accessToken)
    .send({ query: "{workspace {id}}" })
    .expect("Content-Type", /json/)
    .then((data) => {
      expect(data.body.errors.length).toEqual(1);
    });
});

test("No auth header", async () => {
  await request
    .post("/api/graphql")
    .send({ query: "{workspace {id}}" })
    .expect("Content-Type", /json/)
    .then((data) => {
      expect(data.body.errors.length).toEqual(1);
    });
});
