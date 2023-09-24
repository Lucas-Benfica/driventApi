import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { ticketService } from '@/services/tickets-service';
import { TicketTypeID } from '@/schemas/tickets-schemas';

export async function getTicketTypes(req: AuthenticatedRequest, res: Response) {
  const ticketTypes = await ticketService.getTicketTypes();
  return res.status(httpStatus.OK).send(ticketTypes);
}

export async function getTicket(req: AuthenticatedRequest, res: Response) {
  const ticket = await ticketService.getTicket(req.userId);
  return res.status(httpStatus.OK).send(ticket);
}

export async function postTicket(req: AuthenticatedRequest, res: Response) {
  const ticketTypeId = req.body as TicketTypeID;
  const response = await ticketService.postTicket(ticketTypeId, req.userId);
  res.status(httpStatus.CREATED).send(response);
}