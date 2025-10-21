import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class HistoryService {
  // Fetch all booked bookings with billing info
  async getBookedHistory(hallId: number) {
    const bookings = await prisma.bookings.findMany({
      where: {
      hall_id: hallId,
      status: { in: ['booked', 'billed'] }, // include both booked and billed
    },
      include: {
        billings: true, // include all billing entries as-is
      },
      orderBy: { function_date: 'asc' },
    });

    if (!bookings.length) {
      throw new NotFoundException(`No booked history found for hall ID ${hallId}`);
    }

    // Return bookings with billing table exactly
    return bookings.map((booking) => ({
      booking_id: booking.booking_id,
      function_date: booking.function_date,
      alloted_from: booking.alloted_datetime_from,
      alloted_to: booking.alloted_datetime_to,
      customer_name: booking.name,
      phone: booking.phone,
      alternate_phone:booking.alternate_phone,
      email: booking.email,
      address:booking.address,
      event_type: booking.event_type,
      tamil_date:booking.tamil_date,
      tamil_month:booking.tamil_month,
      rent: booking.rent,
      advance: booking.advance,
      balance: booking.balance,
      billings: booking.billings, // full billing objects as retrieved
    }));
  }

  // Fetch all cancelled bookings with cancellation and billing info
  async getCancelledHistory(hallId: number) {
    const bookings = await prisma.bookings.findMany({
      where: {
        hall_id: hallId,
        status: 'cancelled',
      },
      include: {
        cancels: true, // include cancellation entries
        billings: true, // include billing entries
      },
      orderBy: { function_date: 'desc' }, // latest first
    });

    if (!bookings.length) {
      throw new NotFoundException(
        `No cancelled bookings found for hall ID ${hallId}`,
      );
    }

    // Map response
    return bookings.map((booking) => ({
      booking_id: booking.booking_id,
      function_date: booking.function_date,
      alloted_from: booking.alloted_datetime_from,
      alloted_to: booking.alloted_datetime_to,
      customer_name: booking.name,
      phone: booking.phone,
      email: booking.email,
      event_type: booking.event_type,
      tamil_date:booking.tamil_date,
      tamil_month:booking.tamil_month,
      rent: booking.rent,
      advance: booking.advance,
      balance: booking.balance,
      billings: booking.billings, // full billing objects
      cancels: booking.cancels,   // full cancellation objects
    }));
  }

}

