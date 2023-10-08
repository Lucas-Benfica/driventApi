import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createHotel() {
  return await prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.imageUrl(),
    },
  });
}

export async function createRoomWithHotelId(hotelId: number) {
  return prisma.room.create({
    data: {
      name: '1020',
      capacity: 3,
      hotelId: hotelId,
    },
  });
}

export async function createHotelWithRooms(includeRooms: boolean) {
  return prisma.hotel.create({
    data: {
      image: faker.image.imageUrl(),
      name: faker.name.findName(),
      Rooms: {
        create: {
          capacity: faker.datatype.number({ min: 1, max: 4 }),
          name: faker.name.findName(),
        },
      },
    },
    include: {
      Rooms: includeRooms,
    },
  });
}