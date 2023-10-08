import faker from '@faker-js/faker';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import { cleanDb, generateValidToken } from '../helpers';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
  await cleanDb();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
  it('should respond with status 401 if no token is given', async () => {

  });

  it('should respond with status 401 if given token is not valid', async () => {

  });

  it('should respond with status 401 if there is no session for given token', async () => {

  });

  describe('when token is valid', () => {
    it('should respond with status 404 if the user doenst has booking ', async () => {

    });

    it('should respond with status 200 and booking information when user has a booking', async () => {

    });
  });
});

describe('POST /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
  });

  it('should respond with status 401 if given token is not valid', async () => {

  });

  it('should respond with status 401 if there is no session for given token', async () => {

  });

  describe('when token is valid', () => {
    it('should respond with status 404 if the roomId doesnt exists ', async () => {

    });

    it('should respond with status 403 when user doestn have an enrrolment yet', async () => {

    });

    it('should respond with status 403 when user doestn have an ticket yet', async () => {

    });

    it('should respond with status 403 when the room is at max capacity', async () => {

    });

    it('should respond with status 403 when the ticket isnt Paid', async () => {

    });

    it('should respond with status 403 when the user ticket type is remote', async () => {

    });

    it('should respond with status 403 when the user ticket type doesnt include hotel', async () => {

    });

    it('should respond with status 200 and return the bookingId', async () => {

    });
  });
});

describe('PUT /booking:bookingId', () => {
  it('should respond with status 401 if no token is given', async () => {

  });

  it('should respond with status 401 if given token is not valid', async () => {

  });

  it('should respond with status 401 if there is no session for given token', async () => {

  });

  describe('when token is valid', () => {
    it('should respond with status 404 when bookingId doesnt exists', async () => {

    });

    it('should respond with status 404 when the room does not exists', async () => {

    });

    it('should respond with status 403 when the room is at max capacity', async () => {

    });

    it('should respond with status 403 when the user does not have a booking', async () => {

    });

    it('should respond with status 200 and return the bookingId', async () => {

    });
  });
});
