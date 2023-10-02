import { notFoundError } from "@/errors";
import { paymentError } from "@/errors/payment-error";
import { enrollmentRepository, hotelsRepository, ticketsRepository } from "@/repositories";

async function getHotels(userId: number) {
    await ticketErrorHandler(userId);

    const hotels = await hotelsRepository.findHotels();
    if(hotels.length === 0) throw notFoundError("No hotels found.");

    return hotels;
}

async function getHotelById(userId: number, hotelId:number) {
    const hotel = await hotelsRepository.findHotelById(hotelId);
    if (!hotel) throw notFoundError("No hotel found from requested id");
    await ticketErrorHandler(userId);

    const hotelWithRooms = await hotelsRepository.findHotelRooms(hotelId);
    return hotelWithRooms;
}

async function ticketErrorHandler(userId: number) {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) throw notFoundError("No enrollments found from user");

    const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
    if (!ticket) throw notFoundError('No ticket from user enrollment');

    if(ticket.status !== 'PAID') throw paymentError();

    const ticketType = await ticketsRepository.findTicketTypeById(ticket.ticketTypeId);
    if (!ticketType.includesHotel || ticketType.isRemote ) throw paymentError();

}

export const hotelsService = {
    getHotels,
    getHotelById
}