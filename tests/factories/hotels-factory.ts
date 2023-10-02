import faker from "@faker-js/faker";
import { Hotel } from "@prisma/client";
import { prisma } from "@/config";

export async function createHotel(params: Partial<Hotel> = {}){
    return await prisma.hotel.create({
        data: {
            name: params.name || faker.company.companyName(),
            image: params.image || faker.image.business(),
        }
    });
}

export async function createRoom(hotelId: number) {
    return await prisma.room.create({
        data: {
            name: faker.company.companySuffix(),
            capacity: faker.datatype.number(128),
            hotelId,
        }
    });
}