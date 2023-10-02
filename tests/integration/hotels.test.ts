import app, { init } from "@/app"
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import supertest from "supertest";
import { cleanDb } from "../helpers";
import * as jwt from 'jsonwebtoken';
import { createUser } from "../factories";

beforeAll(async () => {
    await init();
});
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
        const result = await server.get('hotels').set('Authorization', `Bearer ${token}`);
        expect(result.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
        //Criar um usuário
        const newUser = await createUser();
        //criar um token sem ter feito login
        const token = jwt.sign({userId: newUser.id}, process.env.JWT_SECRET);

        const result = await server.get('hotels').set('Authorization', `Bearer ${token}`);
        expect(result.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', () => {
        it('should respond with status 404 when user doesnt have enrollment', async () => {

        });

        it('should respond with status 404 when user doesnt have ticket', async () => {

        });

        it('should respond with status 402 when user hasnt paid ticket', async () => {

        });

        it('should respond with status 402 when ticket doesnt include hotel', async () => {

        });

        it('should respond with status 404 when there is no hotels', async () => {

        });

        it('should respond with status 200 and with hotels data', async () => {

        });
    });
})

describe('GET /hotels/:hotelId', () => {
    it('should respond with status 401 if no token is given', async () => {

    });

    it('should respond with status 401 if given token is not valid', async () => {

    });

    it('should respond with status 401 if there is no session for given token', async () => {

    });

    describe('when token is valid', () => {
        it('should respond with status 404 when hotel doesnt exists', async () => {

        });

        it('should respond with status 404 when user doesnt have enrollment', async () => {

        });

        it('should respond with status 404 when user doesnt have ticket', async () => {

        });

        it('should respond with status 402 when user hasnt paid ticket', async () => {

        });

        it('should respond with status 402 when ticket doesnt include hotel', async () => {

        });

        it('should respond with status 200 and with hotel rooms data', async () => {


        });
    });
});