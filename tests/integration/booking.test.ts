import faker from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import {
  createEnrollmentWithAddress,
  createUser,
  createTicketType,
  createTicket,
  generateCreditCardData,
  createTicketTypeWithParams,
} from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import { createHotelWithRooms } from '../factories/hotels-factory';
import { createBooking } from '../factories/booking-factory';
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
    const response = await server.get('/booking');
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();
    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 if the user doenst has booking ', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 200 and booking information when user has a booking', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithParams(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const body = { ticketId: ticket.id, cardData: generateCreditCardData() };
      await server.post('/payments/process').set('Authorization', `Bearer ${token}`).send(body);
      const hotel = await createHotelWithRooms(true);
      await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: hotel.Rooms[0].id });
      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
      expect(response.body).toEqual({
        id: expect.any(Number),
        Room: {
          id: expect.any(Number),
          name: expect.any(String),
          capacity: expect.any(Number),
          hotelId: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      });
      expect(response.status).toEqual(httpStatus.OK);
    });
  });
});

describe('POST /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/booking');
    expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();
    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
    expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
    expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 if the roomId doesnt exists ', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithParams(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const body = { ticketId: ticket.id, cardData: generateCreditCardData() };
      await server.post('/payments/process').set('Authorization', `Bearer ${token}`).send(body);
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 89474 });
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 403 when user doestn have an enrrolment yet', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotelWithRooms(true);
      const room = hotel.Rooms[0];
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when user doestn have an ticket yet', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotelWithRooms(true);
      const room = hotel.Rooms[0];
      await createEnrollmentWithAddress(user);
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when the room is at max capacity', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotelWithRooms(true);
      const room = hotel.Rooms[0];
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      for (let i = 0; i < room.capacity; i++) {
        const newRoomOccupant = await createUser();
        await createBooking(newRoomOccupant.id, room.id);
      }
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when the ticket isnt Paid', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotelWithRooms(true);
      const room = hotel.Rooms[0];
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when the user ticket type is remote', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotelWithRooms(true);
      const room = hotel.Rooms[0];
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(true, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when the user ticket type doesnt include hotel', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotelWithRooms(true);
      const room = hotel.Rooms[0];
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, false);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 200 and return the bookingId', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotelWithRooms(true);
      const room = hotel.Rooms[0];
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const sendBody = { roomId: room.id };
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(sendBody);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({ bookingId: expect.any(Number) });
    });
  });
});

describe('PUT /booking:bookingId', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.put('/booking/0');
    expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();
    const response = await server.put('/booking/0').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
    expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const response = await server.put('/booking/0').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
    expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when bookingId doesnt exists', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotelWithRooms(true);
      const room = hotel.Rooms[0];
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createBooking(user.id, room.id);
      const response = await server.put(`/booking/0`).set('Authorization', `Bearer ${token}`).send({ roomId: room.id });

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 404 when the room does not exists', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotelWithRooms(true);
      const room = hotel.Rooms[0];
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const booking = await createBooking(user.id, room.id);
      const response = await server
        .put(`/booking/${booking.id + 1}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: room.id + 1 });
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 403 when the room is at max capacity', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotelWithRooms(true);
      const fisrtRoom = hotel.Rooms[0];
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const booking = await createBooking(user.id, fisrtRoom.id);
      const secondHotel = await createHotelWithRooms(true);
      const secondRoom = secondHotel.Rooms[0];
      for (let i = 0; i < secondRoom.capacity; i++) {
        const otherUser = await createUser();
        await createBooking(otherUser.id, secondRoom.id);
      }
      const response = await server
        .put(`/booking/${booking.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: secondRoom.id });

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when the user does not have a booking', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotelWithRooms(true);
      const room = hotel.Rooms[0];
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const response = await server
        .put(`/booking/${1}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: room.id });
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 200 and return the bookingId', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotelWithRooms(true);
      const firstRoom = hotel.Rooms[0];
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const booking = await createBooking(user.id, firstRoom.id);
      const secondHotel = await createHotelWithRooms(true);
      const secondRoom = secondHotel.Rooms[0];
      const response = await server
        .put(`/booking/${booking.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: secondRoom.id });
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({ bookingId: booking.id });
    });
  });
});
