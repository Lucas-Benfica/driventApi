import { notFoundError } from "@/errors";
import { enrollmentRepository } from "@/repositories";
import { ticketsRepository } from "@/repositories/tickets-repository";
import { TicketTypeID } from "@/schemas/tickets-schemas";
import { TicketType } from "@prisma/client";

export type TicketResponse = {
    id: number;
    status: string; //RESERVED | PAID
    ticketTypeId: number;
    enrollmentId: number;
    TicketType: {
        id: number;
        name: string;
        price: number;
        isRemote: boolean;
        includesHotel: boolean;
        createdAt: Date;
        updatedAt: Date;
    };
    createdAt: Date;
    updatedAt: Date;
};

async function getTicketTypes(): Promise<TicketType[] | null> {
    const types = await ticketsRepository.getTicketTypes();
    return types;
}

async function getTicket(ownerId: number): Promise<TicketResponse | null> {
    const ticket = await ticketsRepository.getTicket(ownerId);
    if (!ticket) throw notFoundError('Ticket not found');
    return ticket;
}

async function postTicket(id: TicketTypeID, userId: number): Promise<TicketResponse> {
    const tickedTypeId = id.ticketTypeId;
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) {
        throw notFoundError('Enrollment not found');
    }

    const result = ticketsRepository.createTicket(tickedTypeId, enrollment.id);
    return result;
}

export const ticketService = {
    getTicket,
    getTicketTypes,
    postTicket
};