import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { getTicket, getTicketTypes, postTicket } from '@/controllers/tickets-controller';
import { ticketsSchema } from '@/schemas/tickets-schemas';

const ticketsRouter = Router();

ticketsRouter 
    .all('/*', authenticateToken)
    .get('/', getTicket)
    .get('/types', getTicketTypes)
    .post('/',validateBody(ticketsSchema), postTicket);

export { ticketsRouter };
