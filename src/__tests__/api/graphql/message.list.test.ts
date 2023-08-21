
import supertest from 'supertest';
import * as http from 'http';

import * as db from '../db';
import * as login from '../login';
import requestHandler from './requestHandler';

let server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
let request: supertest.SuperTest<supertest.Test>;
let accessToken: string | undefined;

jest.setTimeout(10000);

beforeAll( async () => {
  server = http.createServer(requestHandler);
  server.listen();
  request = supertest(server);
  await db.reset();
  return new Promise(resolve => setTimeout(resolve, 500));
});

afterAll((done) => {
  server.close(done);
  db.shutdown();
});

const personal: string = '5bbc4774-4a9f-4647-bf86-bc65842e1cbb';
const empty: string = '6f99af3a-795e-48a0-aae3-85ad799ed6e9';
const badUUID: string = '00000000-0000-4000-a000-000000000000';
const invalidUUID: string = 'invalidUUID';

test('GET All - Invalid UUID', async () => {
  await request.post('/api/graphql')
    .send({query: `{message(cid: "${invalidUUID}") {id}}`})
    .expect('Content-Type', /json/)
    .then((data) => {
      expect(data.body.errors.length).toEqual(1);
    });
});

test('GET All - Non-Existing Channel', async () => {
  accessToken = await login.asMolly(request);
  await request.post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{message(cid: "${badUUID}") {id}}`})
    .expect(200)
    .expect('Content-Type', /json/)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.data).toBeDefined();
      expect(data.body.data.message.length).toEqual(0);
    });
});
  
test('GET All - Empty Channel', async () => {
  accessToken = await login.asMolly(request);
  await request.post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{message(cid: "${empty}") {id}}`})
    .expect(200)
    .expect('Content-Type', /json/)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.data).toBeDefined();
      expect(data.body.data.message.length).toEqual(0);
    });
});

test('GET All - Personal Channel', async () => {
  accessToken = await login.asMolly(request);
  await request.post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{message(cid: "${personal}") {id}}`})
    .expect(200)
    .expect('Content-Type', /json/)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.data).toBeDefined();
      expect(data.body.data.message.length).toEqual(2);
    });
});
