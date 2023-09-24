import { TicketStatus } from '@prisma/client';
import { prisma } from '@/config';
import { TicketResponse } from '@/services/tickets-service';

async function getTicket(userId: number): Promise<TicketResponse | null> {
    const ticket = await prisma.ticket.findFirst({
        where: {
            Enrollment: {
                userId: userId,
            },
        },
        include: {
            TicketType: true,
        },
    });
    return ticket as TicketResponse;
}

async function getTicketTypes() {
    return prisma.ticketType.findMany();
}

async function createTicket(ticketId: number, enrollmentId: number): Promise<TicketResponse> {
    const ticket = await prisma.ticket.create({
        data: {
            enrollmentId: enrollmentId,
            ticketTypeId: ticketId,
            status: TicketStatus.RESERVED,
        },
    });
    const tickType = await prisma.ticketType.findFirst({
        where: {
            id: ticketId,
        },
    });

    const result: TicketResponse = {
        id: ticket.id,
        status: ticket.status.toString(),
        ticketTypeId: ticket.ticketTypeId,
        enrollmentId: ticket.enrollmentId,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        TicketType: tickType,
    };

    return result;
}

export const ticketsRepository = {
    createTicket,
    getTicket,
    getTicketTypes
};