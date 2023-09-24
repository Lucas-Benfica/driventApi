import Joi from 'joi';

export type TicketTypeID = { 
    ticketTypeId: number 
};

export const ticketsSchema = Joi.object<TicketTypeID>({
  ticketTypeId: Joi.number().required(),
});