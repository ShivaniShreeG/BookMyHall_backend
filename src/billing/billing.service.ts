import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class BillingService {
  // 1️⃣ All billings for a hall
  async findAllByHall(hallId: number) {
    const billings = await prisma.billing.findMany({
      where: { hall_id: hallId },
      select: {
        id: true,
        hall_id: true,
        user_id: true,
        booking_id: true,
        reason: true,
        total: true,
        updated_at: true,
      },
      orderBy: { updated_at: 'desc' },
    });

    if (!billings.length)
      throw new NotFoundException(`No billings found for hall ID ${hallId}`);
    return billings;
  }

  // 2️⃣ All billings for a specific booking
  async findByBooking(hallId: number, bookingId: number) {
    const billings = await prisma.billing.findMany({
      where: { hall_id: hallId, booking_id: bookingId },
      select: {
        id: true,
        hall_id: true,
        user_id: true,
        booking_id: true,
        reason: true,
        total: true,
        updated_at: true,
      },
      orderBy: { updated_at: 'desc' },
    });

    if (!billings.length)
      throw new NotFoundException(
        `No billings found for hall ID ${hallId} and booking ID ${bookingId}`,
      );
    return billings;
  }

  // 3️⃣ Optional: Billings for a specific user in a hall
  async findByUser(hallId: number, userId: number) {
    const billings = await prisma.billing.findMany({
      where: { hall_id: hallId, user_id: userId },
      select: {
        id: true,
        hall_id: true,
        user_id: true,
        booking_id: true,
        reason: true,
        total: true,
        updated_at: true,
      },
      orderBy: { updated_at: 'desc' },
    });

    if (!billings.length)
      throw new NotFoundException(
        `No billings found for hall ID ${hallId} and user ID ${userId}`,
      );
    return billings;
  }
}
