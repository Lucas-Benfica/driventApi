import app, { init } from "@/app"
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import supertest from "supertest";
import { cleanDb, generateValidToken } from "../helpers";
import * as jwt from 'jsonwebtoken';
import {
    createUser, createEnrollmentWithAddress,
    createTicket, createTicketType, createHotel, createRoom
} from "../factories";
import { TicketStatus } from "@prisma/client";

beforeAll(async () => {
    await init();
});
beforeEach(async () => {
    await cleanDb();
})
afterAll(async () => {
    await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
    //Token Inválido
    it("Should respond with status 401 if no token is given", async () => {
        const result = await server.get('/hotels');
        expect(result.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('Should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();
        const result = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(result.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
        //Criar um usuário
        const newUser = await createUser();
        //criar um token sem ter feito login
        const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET);

        const result = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(result.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', () => {
        it('should respond with status 404 when user doesnt have enrollment', async () => {
            const newUser = await createUser();
            const token = await generateValidToken(newUser);

            const result = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(result.status).toBe(httpStatus.NOT_FOUND);
        });

        it('should respond with status 404 when user doesnt have ticket', async () => {
            const newUser = await createUser();
            const token = await generateValidToken(newUser);
            await createEnrollmentWithAddress(newUser);

            const result = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(result.status).toBe(httpStatus.NOT_FOUND);
        });

        it('should respond with status 402 when user hasnt paid ticket', async () => {
            const newUser = await createUser();
            const token = await generateValidToken(newUser);
            const enrollment = await createEnrollmentWithAddress(newUser);

            const ticketType = await createTicketType();

            await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

            const result = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(result.status).toBe(httpStatus.PAYMENT_REQUIRED);
        });

        it('should respond with status 402 when ticket doesnt include hotel', async () => {
            const newUser = await createUser();
            const token = await generateValidToken(newUser);
            const enrollment = await createEnrollmentWithAddress(newUser);
            const ticketType = await createTicketType();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

            const result = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(httpStatus.PAYMENT_REQUIRED);
        });

        it('should respond with status 404 when there is no hotels', async () => {
            const newUser = await createUser();
            const token = await generateValidToken(newUser);
            const enrollment = await createEnrollmentWithAddress(newUser);
            const ticketType = await createTicketType(true);
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

            const result = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(httpStatus.NOT_FOUND);
        });

        it('should respond with status 200 and with hotels data', async () => {
            const hotel = await createHotel();

            const newUser = await createUser();
            const token = await generateValidToken(newUser);
            const enrollment = await createEnrollmentWithAddress(newUser);
            const ticketType = await createTicketType();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

            const result = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(httpStatus.OK);

            expect(result.body).toEqual([
                {
                    id: hotel.id,
                    name: hotel.name,
                    image: hotel.image,
                    createdAt: hotel.createdAt.toISOString(),
                    updatedAt: hotel.updatedAt.toISOString(),
                }
            ])
        });
    });
})

describe('GET /hotels/:hotelId', () => {
    it('should respond with status 401 if no token is given', async () => {
        const idNumber = faker.datatype.number(64);
        const result = await server.get(`/hotels/${idNumber}`);
        expect(result.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
        const idNumber = faker.datatype.number(64);
        const token = faker.lorem.word();

        const result = await server.get(`/hotels/${idNumber}`).set('Authorization', `Bearer ${token}`);;
        expect(result.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
        const newUser = await createUser();
        const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET);
        const idNumber = faker.datatype.number(64);

        const result = await server.get(`/hotels/${idNumber}`).set('Authorization', `Bearer ${token}`);;

        expect(result.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', () => {
        it('should respond with status 404 when hotel doesnt exists', async () => {
            const newUser = await createUser();
            const token = await generateValidToken(newUser);
            const idNumber = faker.datatype.number(64);

            const result = await server.get(`/hotels/${idNumber}`).set('Authorization', `Bearer ${token}`);;

            expect(result.status).toBe(httpStatus.NOT_FOUND);
        });

        it('should respond with status 404 when user doesnt have enrollment', async () => {
            const newUser = await createUser();
            const token = await generateValidToken(newUser);
            const hotel = await createHotel();

            const result = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);;

            expect(result.status).toBe(httpStatus.NOT_FOUND);
        });

        it('should respond with status 404 when user doesnt have ticket', async () => {
            const newUser = await createUser();
            const token = await generateValidToken(newUser);
            await createEnrollmentWithAddress(newUser);

            const hotel = await createHotel();

            const result = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);;

            expect(result.status).toBe(httpStatus.NOT_FOUND);
        });

        it('should respond with status 402 when user hasnt paid ticket', async () => {
            const newUser = await createUser();
            const token = await generateValidToken(newUser);
            const enrollment = await createEnrollmentWithAddress(newUser);
            const ticketType = await createTicketType();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

            const hotel = await createHotel();

            const result = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);;

            expect(result.status).toBe(httpStatus.PAYMENT_REQUIRED);
        });

        it('should respond with status 402 when ticket doesnt include hotel', async () => {
            const newUser = await createUser();
            const token = await generateValidToken(newUser);
            const enrollment = await createEnrollmentWithAddress(newUser);
            const ticketType = await createTicketType();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

            const hotel = await createHotel();

            const result = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);;

            expect(result.status).toBe(httpStatus.PAYMENT_REQUIRED);
        });

        it('should respond with status 200 and with hotel rooms data', async () => {
            const newUser = await createUser();
            const token = await generateValidToken(newUser);
            const enrollment = await createEnrollmentWithAddress(newUser);
            const ticketType = await createTicketType(true);
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const hotel = await createHotel();
            const room = await createRoom(hotel.id);


            const result = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);;

            expect(result.status).toBe(httpStatus.OK);

            expect(result.body).toEqual({
                id: hotel.id,
                name: hotel.name,
                image: hotel.image,
                createdAt: hotel.createdAt.toISOString(),
                updatedAt: hotel.updatedAt.toISOString(),
                Rooms: [
                    {
                        id: room.id,
                        name: room.name,
                        capacity: room.capacity,
                        hotelId: room.hotelId,
                        createdAt: room.createdAt.toISOString(),
                        updatedAt: room.updatedAt.toISOString(),
                    },
                ],
            });
        });
    });
});