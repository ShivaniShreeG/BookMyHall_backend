import { Injectable, NotFoundException ,BadRequestException} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateCancelDto } from './dto/create.dto';

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
  const booking = await prisma.bookings.findUnique({
    where: { hall_id_booking_id: { hall_id: hallId, booking_id: bookingId } },
    include: {
      billings: true, // fetch all billing records for this booking
      cancels: true,  // fetch cancel records if exist
    },
  });

  if (!booking) throw new NotFoundException(`Booking not found`);

  return booking;
}


  async cancelBooking(createCancelDto: CreateCancelDto) {
  const { hall_id, booking_id, user_id, reason, cancel_charge } = createCancelDto;

  // Fetch booking with its billing
  const booking = await prisma.bookings.findUnique({
    where: { hall_id_booking_id: { hall_id, booking_id } },
    include: { billings: true }, // get billing total
  });

  if (!booking)
    throw new NotFoundException(`Booking not found for hall ID ${hall_id} and booking ID ${booking_id}`);

  if (booking.status === 'cancelled')
    throw new BadRequestException('Booking is already cancelled');

  // Use the total from billing if exists, else fallback to advance
  const totalPaid = booking.billings?.[0]?.total ?? booking.advance;

  // Ensure cancel charge does not exceed total paid
  const appliedCancelCharge = cancel_charge > totalPaid ? totalPaid : cancel_charge;

  const refund = totalPaid - appliedCancelCharge;

  return await prisma.$transaction(async (tx) => {
    // 1. Update booking status
    const updatedBooking = await tx.bookings.update({
      where: { hall_id_booking_id: { hall_id, booking_id } },
      data: { status: 'cancelled' },
    });

    // 2. Create cancel record
    const cancelRecord = await tx.cancel.create({
      data: {
        hall_id,
        user_id,
        booking_id,
        reason,
        advance_paid: booking.advance,
        total_paid: totalPaid,
        cancel_charge: appliedCancelCharge,
        refund,
      },
    });

    // 3. Insert expense
    await tx.expense.create({
      data: {
        hall_id,
        reason: `Cancelled booking ID ${booking_id}: Cancellation charge`,
        amount: appliedCancelCharge,
      },
    });

    return { updatedBooking, cancelRecord };
  });
}
}
