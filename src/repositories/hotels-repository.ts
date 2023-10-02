import { prisma } from "@/config";
import { Hotel, Room } from '@prisma/client';

async function findHotels(){
    return await prisma.hotel.findMany();
}

async function findHotelById(hotelId: number){
    return await prisma.hotel.findUnique({
        where: {
            id: hotelId
        }
    })
}

async function findHotelRooms(hotelId: number): Promise<HotelRooms> {
    const hotel = await findHotelById(hotelId);
    const rooms = await prisma.room.findMany({
        where: {
            hotelId: hotelId
        }
    })
    return {
        ...hotel, Rooms: rooms
    }
}

export const hotelsRepository = {
    findHotels,
    findHotelById,
    findHotelRooms,
  };
  

export type HotelRooms = Hotel & {
    Rooms: Room[];
};