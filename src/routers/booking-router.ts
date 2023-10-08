import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { createBookingSchema } from '@/schemas/booking-schemas';
import { getUserBooking, postBooking, putBooking } from '@/controllers/booking-controller';

const bookingRouter = Router();

bookingRouter
    .all('/*', authenticateToken)
    .get('/',  getUserBooking)
    .post('/', validateBody(createBookingSchema), postBooking)
    .put('/:bookingId', validateBody(createBookingSchema), putBooking);

export { bookingRouter };
