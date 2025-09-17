import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class BookingsService {
  // 1️⃣ Fetch all bookings for a hall
  async findAllByHall(hallId: number) {
    const bookings = await prisma.bookings.findMany({
      where: { hall_id: hallId },
      select: {
        booking_id: true,
        hall_id: true,
        user_id: true,
        function_date: true,
        alloted_datetime_from: true,
        alloted_datetime_to: true,
        phone: true,
        name: true,
        address: true,
        alternate_phone: true,
        status: true,
        rent: true,
        advance: true,
        balance: true,
      },
      orderBy: { function_date: 'asc' },
    });

    if (!bookings.length)
      throw new NotFoundException(`No bookings found for hall ID ${hallId}`);
    return bookings;
  }

  // 2️⃣ Fetch one booking by hall + booking_id (compound key)
  async findOneByHall(hallId: number, bookingId: number) {
    const booking = await prisma.bookings.findUnique({
      where: {
        hall_id_booking_id: {
          hall_id: hallId,
          booking_id: bookingId,
        },
      },
      select: {
        booking_id: true,
        hall_id: true,
        user_id: true,
        function_date: true,
        alloted_datetime_from: true,
        alloted_datetime_to: true,
        phone: true,
        name: true,
        address: true,
        alternate_phone: true,
        status: true,
        rent: true,
        advance: true,
        balance: true,
      },
    });

    if (!booking)
      throw new NotFoundException(
        `Booking ID ${bookingId} not found in hall ${hallId}`,
      );
    return booking;
  }
  async findByMonth(hallId: number, month: number, year: number) {
  // Create start and end dates for the month
  const startDate = new Date(year, month - 1, 1, 0, 0, 0); // month is 0-indexed
  const endDate = new Date(year, month, 0, 23, 59, 59); // last day of month

  const bookings = await prisma.bookings.findMany({
    where: {
      hall_id: hallId,
      function_date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      booking_id: true,
      hall_id: true,
      user_id: true,
      function_date: true,
      alloted_datetime_from: true,
      alloted_datetime_to: true,
      phone: true,
      name: true,
      address: true,
      alternate_phone: true,
      status: true,
      rent: true,
      advance: true,
      balance: true,
    },
    orderBy: { function_date: 'asc' },
  });

  if (!bookings.length)
    throw new NotFoundException(
      `No bookings found for hall ID ${hallId} in ${month}/${year}`,
    );
  return bookings;
}

  // 3️⃣ Optional: fetch by hall + function_date
  async findByFunctionDate(hallId: number, dateStr: string) {
    const date = new Date(dateStr);
    const booking = await prisma.bookings.findUnique({
      where: {
        hall_id_function_date: {
          hall_id: hallId,
          function_date: date,
        },
      },
      select: {
        booking_id: true,
        hall_id: true,
        user_id: true,
        function_date: true,
        alloted_datetime_from: true,
        alloted_datetime_to: true,
        phone: true,
        name: true,
        address: true,
        alternate_phone: true,
        status: true,
        rent: true,
        advance: true,
        balance: true,
      },
    });

    if (!booking)
      throw new NotFoundException(
        `No booking found for hall ID ${hallId} on date ${dateStr}`,
      );
    return booking;
  }
}
