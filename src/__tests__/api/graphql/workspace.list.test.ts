
import * as http from 'http';
import supertest from 'supertest';
import 'whatwg-fetch'

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

test('GET All - Not logged in', async () => {
  await request.post('/api/graphql')
    .send({query: '{workspace {id}}'})
    .expect('Content-Type', /json/)
    .then((data) => {
      expect(data.body.errors.length).toEqual(1);
    });
});

test('GET Molly All', async () => {
  accessToken = await login.asMolly(request);
  await request.post('/api/graphql')
    .send({query: '{workspace {name}}'})
    .set('Authorization', 'Bearer ' + accessToken)
    .expect(200)
    .expect('Content-Type', /json/)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.data).toBeDefined();
      expect(data.body.data.workspace).toBeDefined();
      expect(data.body.data.workspace.length).toEqual(3);
    });
});
