
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

const mollyWorkspace: string = 'f484042b-6dd1-4fb3-bf44-1331ab15432f';
const mollyChannel: string = '5bbc4774-4a9f-4647-bf86-bc65842e1cbb';

const annaChannel: string = '0f9cb35b-35f5-4dbd-9a78-c319cba84461';

test('Delete Authorized', async () => {
  accessToken = await login.asMolly(request);
  await request.post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation { deleteChannel (input: {
        id: "${mollyChannel}"
      }) {
        id, wid, name
      }
    }`})
    .expect(200)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.data).toBeDefined();
      expect(data.body.data.deleteChannel.id).toBeDefined();
      expect(data.body.data.deleteChannel.wid).toEqual(mollyWorkspace);
      expect(data.body.data.deleteChannel.name).toEqual('Molly Personal Channel');
    });
});

test('GET channels in workspace after delete', async () => {
  accessToken = await login.asMolly(request);
  await request.post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{channel(wid: "${mollyWorkspace}") {id, name}}`})
    .expect(200)
    .expect('Content-Type', /json/)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.data).toBeDefined();
      expect(data.body.data.channel.length).toEqual(1);
    });
});

test('GET messages in deleted channel', async () => {
  accessToken = await login.asMolly(request);
  await request.post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{message(cid: "${mollyChannel}") {id}}`})
    .expect(200)
    .expect('Content-Type', /json/)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.data).toBeDefined();
      expect(data.body.data.message.length).toEqual(0);
    });
});

test('Delete Unauthorized', async () => {
  accessToken = await login.asMolly(request);
  await request.post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation { deleteChannel (input: {
        id: "${annaChannel}"
      }) {
        id, wid, name
      }
    }`})
    .expect('Content-Type', /json/)
    .then((data) => {
      expect(data.body.errors.length).toEqual(1);
    });
});
