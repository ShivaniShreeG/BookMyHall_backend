import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AddChargesDto } from './dto/add-charges.dto';
import { AddBalancePaymentDto } from './dto/add-balance-payment.dto'; // 👈 import it

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
  async addCharges(
    hallId: number,
    bookingId: number,
    addChargesDto: AddChargesDto,
  ) {
    const { userId, charges } = addChargesDto;

    // Fetch booking along with existing charges and billing
    const booking = await prisma.bookings.findUnique({
      where: { hall_id_booking_id: { hall_id: hallId, booking_id: bookingId } },
      include: { billings: true, charges: true },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    const advanceAmount = booking.advance;

    return prisma.$transaction(async (tx) => {
      let newChargesTotal = 0;

      // Insert new charges
      for (const charge of charges) {
        await tx.charges.create({
          data: {
            hall_id: hallId,
            booking_id: bookingId,
            reason: charge.reason,
            amount: charge.amount,
          },
        });
        newChargesTotal += charge.amount;
      }

      // Sum existing charges
      const existingChargesTotal = booking.charges.reduce((sum, c) => sum + c.amount, 0);

      // Calculate total amount (advance + all charges)
      const totalAmount = advanceAmount + existingChargesTotal + newChargesTotal;

      // Prepare billing reason JSON
      const reasonJson: Record<string, number> = { advance: advanceAmount };
      for (const c of booking.charges) reasonJson[c.reason] = c.amount; // existing charges
      for (const c of charges) reasonJson[c.reason] = c.amount; // new charges

      // Upsert billing
      if (booking.billings.length > 0) {
        await tx.billing.update({
          where: { id: booking.billings[0].id },
          data: { reason: reasonJson, total: totalAmount },
        });
      } else {
        await tx.billing.create({
          data: {
            hall_id: hallId,
            user_id: userId,
            booking_id: bookingId,
            reason: reasonJson,
            total: totalAmount,
          },
        });
      }
       // ✅ Update booking status → billed
      await tx.bookings.update({
        where: { hall_id_booking_id: { hall_id: hallId, booking_id: bookingId } },
        data: { status: 'billed' },
      });

      return { success: true, totalAmount, reasonJson };
    });
  }
// 3️⃣ Add Balance Payment
async addBalancePayment(
  hallId: number,
  bookingId: number,
  addBalancePaymentDto: AddBalancePaymentDto,
) {
  const { amount, reason, userId } = addBalancePaymentDto;

  // Fetch booking along with billing & charges
  const booking = await prisma.bookings.findUnique({
    where: { hall_id_booking_id: { hall_id: hallId, booking_id: bookingId } },
    include: { billings: true, charges: true },
  });

  if (!booking) throw new NotFoundException('Booking not found');

  return prisma.$transaction(async (tx) => {
    // 1️⃣ Add a new charge entry for this payment
    const newCharge = await tx.charges.create({
      data: {
        hall_id: hallId,
        booking_id: bookingId,
        reason,
        amount,
      },
    });

    // 2️⃣ Calculate new totals
    const existingChargeTotal = booking.charges.reduce((sum, c) => sum + c.amount, 0);
    const totalCharges = existingChargeTotal + amount;
    const totalAmount = booking.advance + totalCharges;

    // 3️⃣ Prepare updated billing JSON
    const reasonJson: Record<string, number> = { advance: booking.advance };
    for (const c of booking.charges) reasonJson[c.reason] = c.amount;
    reasonJson[reason] = amount;

    // 4️⃣ Update or create billing record
    if (booking.billings.length > 0) {
      await tx.billing.update({
        where: { id: booking.billings[0].id },
        data: {
          reason: reasonJson,
          total: totalAmount,
        },
      });
    } else {
      await tx.billing.create({
        data: {
          hall_id: hallId,
          user_id: userId,
          booking_id: bookingId,
          reason: reasonJson,
          total: totalAmount,
        },
      });
    }

    // 5️⃣ Update booking balance
    const updatedBalance = Math.max(booking.balance - amount, 0); // Prevent negative
    await tx.bookings.update({
      where: { hall_id_booking_id: { hall_id: hallId, booking_id: bookingId } },
      data: { balance: updatedBalance },
    });

    return {
      success: true,
      message: `Balance payment of ₹${amount} added successfully.`,
      remainingBalance: updatedBalance,
      totalAmount,
      reasonJson,
      newCharge,
    };
  });
}

}
