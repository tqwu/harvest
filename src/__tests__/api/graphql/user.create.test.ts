
import http from 'http'
import supertest from 'supertest';
import 'whatwg-fetch'

import * as db from '../db';
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

test('Create New', async () => {
  await request.post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation { createUser(input: {
        email: "teresa@books.com"
        name: "Teresa Member"
        password: "teresamember"
    }) { id, name }}`})
    .expect(200)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.data).toBeDefined();
      expect(data.body.data.createUser.id).toBeDefined();
      expect(data.body.data.createUser.name).toEqual('Teresa Member');
    });
});

test('Create Fail - Existing email linked to account', async () => {
  await request.post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation { createUser(input: {
        email: "molly@books.com"
        name: "Molly Invalid"
        password: "mollyinvalid"
    }) { id, name }}`})
    .expect('Content-Type', /json/)
    .then((data) => {
      expect(data.body.errors.length).toEqual(1);
    });
});
