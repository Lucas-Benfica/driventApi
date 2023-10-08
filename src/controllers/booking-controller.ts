import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { bookingService } from '@/services/booking-service';

export async function getUserBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const result = await bookingService.getUserBooking(userId);
  return res.status(httpStatus.OK).send(result);
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { roomId } = req.body;
  const { userId } = req;
  const result = await bookingService.createBooking(roomId, userId);
  return res.status(httpStatus.OK).send(result);
}

export async function putBooking(req: AuthenticatedRequest, res: Response) {
  const { roomId } = req.body;
  const { bookingId } = req.params;
  const { userId } = req;

  const result = await bookingService.updateBooking(roomId, bookingId, userId);
  res.status(httpStatus.OK).send(result);
}
