import * as nock from 'nock';
import request from 'supertest';
import { runSeed } from 'typeorm-seeding';

import { User } from '../../../src/api/models/User';
import { CreateBruce } from '../../../src/database/seeds/CreateBruce';
import { closeDatabase } from '../../utils/database';
import { BootstrapSettings } from '../utils/bootstrap';
import { prepareServer } from '../utils/server';

describe('/api/users', () => {

  let bruce: User;
  let bruceAuthorization: string;
  let settings: BootstrapSettings;

  // -------------------------------------------------------------------------
  // Setup up
  // -------------------------------------------------------------------------

  beforeAll(async () => {
    settings = await prepareServer({ migrate: true });
    bruce = await runSeed<User>(CreateBruce);
    bruceAuthorization = Buffer.from(`${bruce.username}:1234`).toString('base64');
  });

  // -------------------------------------------------------------------------
  // Tear down
  // -------------------------------------------------------------------------

  afterAll(async () => {
    nock.cleanAll();
    await closeDatabase(settings.connection);
  });

  // -------------------------------------------------------------------------
  // Test cases
  // -------------------------------------------------------------------------

  test('GET: / should return a list of users', async (done) => {
    const response = await request(settings.app)
      .get('/api/users')
      .set('Authorization', `Basic ${bruceAuthorization}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.length).toBe(1);
    done();
  });

  test('GET: /:id should return bruce', async (done) => {
    const response = await request(settings.app)
      .get(`/api/users/${bruce.id}`)
      .set('Authorization', `Basic ${bruceAuthorization}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.id).toBe(bruce.id);
    expect(response.body.username).toBe(bruce.username);
    expect(response.body.email).toBe(bruce.email);
    done();
  });

  test('POST: should create new user', async (done) => {
    const testUser = {
      email: 'hello@fakeemail.net',
      password: 'pwpwpwpw',
      username: 'mycoolusername',
    };
    const response = await request(settings.app)
      .post(`/api/users/`)
      .send(testUser)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.username).toBe(testUser.username);
    done();
  });

  test('POST: should not create user with empty username', async (done) => {
    const testUser = {
      email: 'hello@fakeemail.net',
      password: 'password',
      username: '',
    };
    const response = await request(settings.app)
      .post(`/api/users/`)
      .send(testUser)
      .expect(400);

    expect(response.body.message).toBe('username should not be empty');
    done();
  });

  test('POST: should not create user with empty email', async (done) => {
    const testUser = {
      email: '',
      password: 'password',
      username: 'cool_user',
    };
    const response = await request(settings.app)
      .post(`/api/users/`)
      .send(testUser)
      .expect(400);

    expect(response.body.message).toBe('email invalid');
    done();
  });

  test('POST: should not create user with invalid email', async (done) => {
    const testUser = {
      email: 'not_a_valid_email_string',
      password: 'password',
      username: 'cool_user',
    };
    const response = await request(settings.app)
      .post(`/api/users/`)
      .send(testUser)
      .expect(400);

    expect(response.body.message).toBe('email invalid');
    done();
  });

  test('POST: should not create user with empty password', async (done) => {
    const testUser = {
      email: 'hello@fakeemail.net',
      password: '',
      username: 'cool_user',
    };
    const response = await request(settings.app)
      .post(`/api/users/`)
      .send(testUser)
      .expect(400);

    expect(response.body.message).toBe('password must be atleast 8 characters in length');
    done();
  });

});
