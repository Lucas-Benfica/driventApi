import Joi from 'joi';

export type BookingBody = {
  roomId: number;
};

export const createBookingSchema = Joi.object<BookingBody>({
  roomId: Joi.number().required(),
});
