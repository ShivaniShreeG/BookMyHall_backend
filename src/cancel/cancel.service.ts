import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class CancelService {
  // Fetch all cancels for a hall
  async findAllByHall(hallId: number) {
    const cancels = await prisma.cancel.findMany({
      where: { hall_id: hallId },
      select: {
        id: true,
        hall_id: true,
        user_id: true,
        booking_id: true,
        reason: true,
        advance_paid: true,
        cancel_charge: true,
        refund: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    });

    if (!cancels.length)
      throw new NotFoundException(`No cancels found for hall ID ${hallId}`);
    return cancels;
  }

  // Fetch specific cancel by hall + booking_id (compound key)
  async findOneByBooking(hallId: number, bookingId: number) {
    const cancel = await prisma.cancel.findUnique({
      where: {
        hall_id_booking_id: {
          hall_id: hallId,
          booking_id: bookingId,
        },
      },
      select: {
        id: true,
        hall_id: true,
        user_id: true,
        booking_id: true,
        reason: true,
        advance_paid: true,
        cancel_charge: true,
        refund: true,
        created_at: true,
      },
    });

    if (!cancel)
      throw new NotFoundException(
        `No cancel found for hall ID ${hallId} and booking ID ${bookingId}`,
      );
    return cancel;
  }
}
