import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient ,Prisma} from '@prisma/client';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

const prisma = new PrismaClient();

@Injectable()
export class BookingsService {
  // Fetch all bookings for a hall
  async findAllByHall(hallId: number) {
    const bookings = await prisma.bookings.findMany({
      where: { hall_id: hallId, status:'booked' },
      orderBy: { function_date: 'asc' },
    });

    if (!bookings.length)
      throw new NotFoundException(`No bookings found for hall ID ${hallId}`);
    return bookings;
  }

  // Fetch a specific booking by hall + booking_id
  async findOneByHall(hallId: number, bookingId: number) {
    const booking = await prisma.bookings.findUnique({
      where: { hall_id_booking_id: { hall_id: hallId, booking_id: bookingId } },
    });

    if (!booking)
      throw new NotFoundException(`Booking ID ${bookingId} not found in hall ${hallId}`);
    return booking;
  }

  // Fetch bookings by month
  async findByMonth(hallId: number, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const bookings = await prisma.bookings.findMany({
      where: {
        hall_id: hallId,
        function_date: { gte: startDate, lte: endDate },
      },
      orderBy: { function_date: 'asc' },
    });

    if (!bookings.length)
      throw new NotFoundException(
        `No bookings found for hall ID ${hallId} in ${month}/${year}`,
      );
    return bookings;
  }

  // Fetch bookings by function date
  async findByFunctionDate(hallId: number, dateStr: string) {
  const date = new Date(dateStr);

  const booking = await prisma.bookings.findFirst({
    where: {
      hall_id: hallId,
      status: 'booked', // still booked
      function_date: date,
    },
    include: {
      cancels: true, // include all cancellations
    },
  });

  if (!booking)
    throw new NotFoundException(
      `No booking found for hall ID ${hallId} on date ${dateStr}`,
    );

  return booking;
}

  
  async createBooking(dto: CreateBookingDto) {
  const start = new Date(dto.alloted_datetime_from);
  const end = new Date(dto.alloted_datetime_to);

  if (start >= end)
    throw new BadRequestException('Start time must be before end time');

  // Check overlapping bookings
  // Check overlapping bookings with status 'booked'
const overlap = await prisma.bookings.findFirst({
  where: {
    hall_id: dto.hall_id,
    status: 'booked',  // check only booked
    function_date: new Date(dto.function_date),
    AND: [
      { alloted_datetime_from: { lt: end } },
      { alloted_datetime_to: { gt: start } },
    ],
  },
});

if (overlap)
  throw new BadRequestException('The hall is already booked during this time');

  // Auto-increment booking_id per hall
  const lastBooking = await prisma.bookings.findFirst({
    where: { hall_id: dto.hall_id },
    orderBy: { booking_id: 'desc' },
  });
  const newBookingId = lastBooking ? lastBooking.booking_id + 1 : 1;

  // Calculate balance
  const balance = dto.rent - dto.advance;

  // Create booking + billing in transaction
  return prisma.$transaction(async (tx) => {
    const booking = await tx.bookings.create({
  data: {
    hall_id: dto.hall_id,
    user_id: dto.user_id,
    booking_id: newBookingId,
    function_date: new Date(dto.function_date),
    alloted_datetime_from: start,
    alloted_datetime_to: end,
    name: dto.name,
    phone: dto.phone,
    address: dto.address,
    alternate_phone: dto.alternate_phone
      ? (dto.alternate_phone as unknown as Prisma.InputJsonValue)
      : Prisma.JsonNull,
    email: dto.email ?? null,
    status: 'booked',
    rent: dto.rent,
    advance: dto.advance,
    balance,
    event_type: dto.event_type, // <-- added here
  },
});

    // Insert billing entry with advance
    await tx.billing.create({
      data: {
        hall_id: dto.hall_id,
        user_id: dto.user_id,
        booking_id: newBookingId,
        reason: { advance: dto.advance }, // stored as JSON
        total: dto.advance,
      },
    });

    return booking;
  });
}
async findCustomerByPhone(hallId: number, phone: string) {
  // Ensure phone has +91 prefix
  if (!phone.startsWith('+91')) {
    phone = `+91${phone}`;
  }

  // Find the latest booking for this phone in the hall
  const booking = await prisma.bookings.findFirst({
    where: {
      hall_id: hallId,
      phone: phone,
    },
    orderBy: { booking_id: 'desc' },
  });

  if (!booking) {
    return null; // No customer found
  }

  // Return customer details
  return {
    name: booking.name,
    phone: booking.phone,
    alternate_phone: booking.alternate_phone,
    email: booking.email,
    address: booking.address,
  };
}
async updateBookingTime(hallId: number, bookingId: number, dto: UpdateBookingDto) {
    const booking = await prisma.bookings.findUnique({
      where: { hall_id_booking_id: { hall_id: hallId, booking_id: bookingId } },
    });

    if (!booking) {
      throw new NotFoundException(`Booking ID ${bookingId} not found in hall ${hallId}`);
    }

    const start = new Date(dto.alloted_datetime_from);
    const end = new Date(dto.alloted_datetime_to);
    const functionDate = new Date(dto.function_date);

    if (start >= end) {
      throw new BadRequestException('Start time must be before end time');
    }

    // Check overlapping bookings
    const overlap = await prisma.bookings.findFirst({
      where: {
        hall_id: hallId,
        status: 'booked',
        booking_id: { not: bookingId }, // exclude current booking
        function_date: functionDate,
        AND: [
          { alloted_datetime_from: { lt: end } },
          { alloted_datetime_to: { gt: start } },
        ],
      },
    });

    if (overlap) {
      throw new BadRequestException('The hall is already booked during this time');
    }

    // Update booking
    const updatedBooking = await prisma.bookings.update({
      where: { hall_id_booking_id: { hall_id: hallId, booking_id: bookingId } },
      data: {
        function_date: functionDate,
        alloted_datetime_from: start,
        alloted_datetime_to: end,
      },
    });

    return updatedBooking;
  }

}
