
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

const mollyId: string = 'b603abdf-6e15-4e49-a457-c9394867c7cf';
const annaId: string = '4ae66869-e58a-4f36-8a77-e30b3ea1bd35';

test('Delete Unauthorized', async () => {
  accessToken = await login.asMolly(request);
  await request.post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation { deleteUser (input: {
        id: "${annaId}"
      }) {
        id, name
      }
    }`})
    .expect('Content-Type', /json/)
    .then((data) => {
      expect(data.body.errors.length).toEqual(1);
    });
});

test('Delete Authorized', async () => {
  accessToken = await login.asAnna(request);
  await request.post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation { deleteUser (input: {
        id: "${mollyId}"
      }) {
        id, name
      }
    }`})
    .expect(200)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.data).toBeDefined();
      expect(data.body.data.deleteUser.id).toEqual(mollyId);
      expect(data.body.data.deleteUser.name).toEqual('Molly Member');
    });
});

test('GET All after delete', async () => {
  accessToken = await login.asAnna(request);
  await request.post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: '{user {id, name}}'})
    .expect(200)
    .expect('Content-Type', /json/)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.data).toBeDefined();
      expect(data.body.data.user).toBeDefined();
      expect(data.body.data.user.length).toEqual(3);
    });
});
