import { bookingRepository, enrollmentRepository, ticketsRepository } from '@/repositories';
import { bookingService } from '@/services/booking-service';

describe('GET /booking', () => {
  it('Should throw return the booking when the user have one', async () => {
    const bookingData = { Booking: { id: 1, Room: {} } };
    jest.spyOn(bookingRepository, 'getByUserId').mockImplementationOnce((): any => {
      return bookingData;
    });
    const promise = bookingService.getUserBooking(1);
    expect(promise).resolves.toEqual(bookingData);
  });

  it('Should throw an error when the user doesnt have a booking', async () => {
    jest.spyOn(bookingRepository, 'getByUserId').mockImplementationOnce((): any => {
      return null;
    });

    const promise = bookingService.getUserBooking(1);
    expect(promise).rejects.toEqual({
      name: 'NotFoundError',
      message: 'Booking not found',
    });
  });
});

describe('POST /booking', () => {
  it('Should throw an error when room doesnt exist', async () => {
    jest.spyOn(bookingRepository, 'roomIdExists').mockImplementationOnce((): any => {
      return null;
    });
    const promise = bookingService.createBooking(1, 1);
    expect(promise).rejects.toEqual({
      name: 'NotFoundError',
      message: 'Room not found',
    });
  });

  it('Should throw an error when the room has already reached maximum capacity', async () => {
    jest.spyOn(bookingRepository, 'roomIdExists').mockImplementationOnce((): any => {
      return {
        capacity: 1,
        Booking: [1, 2],
      };
    });
    const promise = bookingService.createBooking(1, 1);
    expect(promise).rejects.toMatchObject({
      name: 'ForbiddenError',
      message: 'Room is full',
    });    
  });

  it('Should throw an error when the user doesnt have a enrollment', async () => {
    jest.spyOn(bookingRepository, 'roomIdExists').mockImplementationOnce((): any => {
      return {
        capacity: 10,
        Booking: [1, 2],
      };
    });
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce((): any => {
      return null;
    });
    const promise = bookingService.createBooking(1, 1);
    expect(promise).rejects.toEqual({
      name: 'ForbiddenError',
      message: 'Enrollment not found',
    });
  });

  it('Should throw an error when the user doesnt have a ticket', async () => {
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce((): any => {
      return { id: 0 };
    });
    jest.spyOn(bookingRepository, 'roomIdExists').mockImplementationOnce((): any => {
      return {
        capacity: 10,
        Booking: [1, 2],
      };
    });
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockImplementationOnce((): any => {
      return null;
    });
    const promise = bookingService.createBooking(1, 1);
    expect(promise).rejects.toEqual({
      name: 'ForbiddenError',
      message: 'Ticket not found',
    });
  });

  it('Should throw an error when the user still need to pay the ticket', async () => {
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce((): any => {
      return { id: 0 };
    });
    jest.spyOn(bookingRepository, 'roomIdExists').mockImplementationOnce((): any => {
      return {
        capacity: 10,
        Booking: [1, 2],
      };
    });
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockImplementationOnce((): any => {
      return { status: 'RESERVED', TicketType: { includesHotel: true, isRemote: false } };
    });
    const promise = bookingService.createBooking(1, 1);
    expect(promise).rejects.toEqual({
      name: 'ForbiddenError',
      message: 'Ticket is not paid',
    });
  });

  it('Should throw an error when the ticket doesnt include an hotel', async () => {
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce((): any => {
      return { id: 0 };
    });
    jest.spyOn(bookingRepository, 'roomIdExists').mockImplementationOnce((): any => {
      return {
        capacity: 10,
        Booking: [1, 2],
      };
    });
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockImplementationOnce((): any => {
      return { status: 'PAID', TicketType: { includesHotel: false, isRemote: false } };
    });

    jest.spyOn(bookingRepository, 'getByUserId').mockImplementationOnce((): any => {
      return {
        Booking: null,
        Room: null,
      };
    });
    const promise = bookingService.createBooking(1, 1);
    expect(promise).rejects.toEqual({
      name: 'ForbiddenError',
      message: 'Ticket does not include hotel',
    });
  });

  it('Should throw an error when the ticket is remote', async () => {
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce((): any => {
      return { id: 0 };
    });
    jest.spyOn(bookingRepository, 'roomIdExists').mockImplementationOnce((): any => {
      return {
        capacity: 10,
        Booking: [1, 2],
      };
    });
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockImplementationOnce((): any => {
      return { status: 'PAID', TicketType: { includesHotel: true, isRemote: true } };
    });

    jest.spyOn(bookingRepository, 'getByUserId').mockImplementationOnce((): any => {
      return {
        Booking: null,
        Room: null,
      };
    });
    const promise = bookingService.createBooking(1, 1);
    expect(promise).rejects.toEqual({
      name: 'ForbiddenError',
      message: 'Ticket is remote',
    });
  });

  it('Should return the booking when the user ask to create one', async () => {
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce((): any => {
      return { id: 0 };
    });
    jest.spyOn(bookingRepository, 'roomIdExists').mockImplementationOnce((): any => {
      return {
        capacity: 10,
        Booking: [1, 2],
      };
    });
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockImplementationOnce((): any => {
      return { status: 'PAID', TicketType: { includesHotel: true, isRemote: false } };
    });

    jest.spyOn(bookingRepository, 'getByUserId').mockImplementationOnce((): any => {
      return {
        Booking: null,
        Room: null,
      };
    });
    const id = 1;
    jest.spyOn(bookingRepository, 'create').mockImplementationOnce((): any => {
      return { id };
    });
    const promise = bookingService.createBooking(1, 1);
    expect(promise).resolves.toEqual({ bookingId: id });
  });
});

describe('PUT /booking', () => {
  it('Should throw an error when room doesnt exist', async () => {
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockImplementationOnce((): any => {
      return { status: 'PAID', TicketType: { includesHotel: true, isRemote: false } };
    });

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce((): any => {
      return { id: 0 };
    });
    jest.spyOn(bookingRepository, 'roomIdExists').mockImplementationOnce((): any => {
      return null;
    });
    jest.spyOn(bookingRepository, 'update').mockImplementationOnce((): any => {
      return { id: 0 };
    });
    const promise = bookingService.updateBooking(0, 1, 1);
    expect(promise).rejects.toEqual({
      name: 'NotFoundError',
      message: 'Room not found',
    });
  });

  it('Should throw an error when the room has already reached maximum capacity', async () => {
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockImplementationOnce((): any => {
      return { status: 'PAID', TicketType: { includesHotel: true, isRemote: false } };
    });

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce((): any => {
      return { id: 0 };
    });

    jest.spyOn(bookingRepository, 'getByUserId').mockImplementationOnce((): any => {
      return { capacity: 1, Booking: [1, 2] };
    });
    jest.spyOn(bookingRepository, 'roomIdExists').mockImplementationOnce((): any => {
      return { capacity: 1, Booking: [1, 2] };
    });

    jest.spyOn(bookingRepository, 'update').mockImplementationOnce((): any => {
      return { id: 0 };
    });
    const promise = bookingService.updateBooking(1, 1, 1);

    expect(promise).rejects.toEqual({
      name: 'ForbiddenError',
      message: 'Room is full',
    });
  });

  it('Should throw an error when doesnt have a booking', async () => {
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockImplementationOnce((): any => {
      return { status: 'PAID', TicketType: { includesHotel: true, isRemote: false } };
    });

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce((): any => {
      return { id: 0 };
    });

    jest.spyOn(bookingRepository, 'getByUserId').mockImplementationOnce((): any => {
      return null;
    });
    jest.spyOn(bookingRepository, 'roomIdExists').mockImplementationOnce((): any => {
      return { id: 0, Booking: [1, 2] };
    });
    jest.spyOn(bookingRepository, 'update').mockImplementationOnce((): any => {
      return { id: 0 };
    });
    const promise = bookingService.updateBooking(1, 1, 1);
    expect(promise).rejects.toEqual({
      name: 'ForbiddenError',
      message: 'Booking not found',
    });
  });

  it('Should return the booking when the user edit it', async () => {
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockImplementationOnce((): any => {
      return { status: 'PAID', TicketType: { includesHotel: true, isRemote: false } };
    });

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce((): any => {
      return { id: 0 };
    });

    jest.spyOn(bookingRepository, 'getByUserId').mockImplementationOnce((): any => {
      return { id: 1 };
    });
    const id = 1;
    jest.spyOn(bookingRepository, 'roomIdExists').mockImplementationOnce((): any => {
      return { id, Booking: [1, 2] };
    });
    jest.spyOn(bookingRepository, 'update').mockImplementationOnce((): any => {
      return { id };
    });

    const promise = bookingService.updateBooking(1, 1, 1);
    expect(promise).resolves.toEqual({ bookingId: id });
  });
});
