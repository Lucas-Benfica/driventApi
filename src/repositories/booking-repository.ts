import { prisma } from '@/config';

async function getByUserId(userId: number) {
  return await prisma.booking.findFirst({
    where: {
      userId: userId
    },
    include: {
      Room: true
    }
  });
}

async function create(userId: number, roomId: number) {
  return await prisma.booking.create({
    data: { userId, roomId }
  });
}

async function update(bookingId: number, roomId: number) {
  return await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      roomId,
    },
  });
}

async function getRoomInfo(id: number) {
  return await prisma.room.findUnique({
    where: { id },
    select: {
      capacity: true,
      _count: { select: { Booking: true } },
    },
  });
}

async function roomIdExists(roomId: number) {
  return await prisma.room.findFirst({
    where: {
      id: roomId,
    },
    include: {
      Booking: true,
    },
  });
}

export const bookingRepository = {
  getByUserId,
  create,
  update,
  roomIdExists,
  getRoomInfo,
};
