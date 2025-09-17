import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class ChargesService {
  // 1️⃣ All charges for a hall
  async findAllByHall(hallId: number) {
    const charges = await prisma.charges.findMany({
      where: { hall_id: hallId },
      select: {
        id: true,
        hall_id: true,
        booking_id: true,
        reason: true,
        amount: true,
      },
      orderBy: { id: 'asc' },
    });

    if (!charges.length)
      throw new NotFoundException(`No charges found for hall ID ${hallId}`);
    return charges;
  }

  // 2️⃣ All charges for a booking
  async findAllByBooking(hallId: number, bookingId: number) {
    const charges = await prisma.charges.findMany({
      where: { hall_id: hallId, booking_id: bookingId },
      select: {
        id: true,
        hall_id: true,
        booking_id: true,
        reason: true,
        amount: true,
      },
      orderBy: { id: 'asc' },
    });

    if (!charges.length)
      throw new NotFoundException(
        `No charges found for hall ID ${hallId} and booking ID ${bookingId}`,
      );
    return charges;
  }
}
