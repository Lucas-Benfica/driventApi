import { TicketStatus } from '@prisma/client';
import { prisma } from '@/config';
import { CreateTicketParams } from '@/protocols';

async function findTicketTypes() {
  const result = await prisma.ticketType.findMany();
  return result;
}

async function findTicketByEnrollmentId(enrollmentId: number) {
  const result = await prisma.ticket.findUnique({
    where: { enrollmentId },
    include: { TicketType: true },
  });

  return result;
}

async function createTicket(ticket: CreateTicketParams) {
  const result = await prisma.ticket.create({
    data: ticket,
    include: { TicketType: true },
  });

  return result;
}

async function findTicketById(ticketId: number) {
  const result = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { TicketType: true },
  });

  return result;
}

async function ticketProcessPayment(ticketId: number) {
  const result = prisma.ticket.update({
    where: {
      id: ticketId,
    },
    data: {
      status: TicketStatus.PAID,
    },
  });

  return result;
}

async function findTicketTypeById(ticketTypeId: number) {
  return await prisma.ticketType.findUnique({
    where: { id: ticketTypeId },
  });
}

export const ticketsRepository = {
  findTicketTypes,
  findTicketByEnrollmentId,
  createTicket,
  findTicketById,
  ticketProcessPayment,
  findTicketTypeById
};
