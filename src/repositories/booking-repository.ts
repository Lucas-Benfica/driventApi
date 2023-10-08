import { prisma } from '@/config';

async function getByUserId(userId: number) {

}

async function create(userId: number, roomId: number) {

}

async function update(bookingId: number, roomId: number) {

}

async function getRoomInfo(id: number) {

}

async function roomIdExists(roomId: number) {

}

export const bookingRepository = {
  getByUserId,
  create,
  update,
  roomIdExists,
  getRoomInfo,
};
