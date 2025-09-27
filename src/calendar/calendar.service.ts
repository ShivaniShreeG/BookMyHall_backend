import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class CalendarService {
  // 📅 1. Full calendar (bookings + peak hours + availability)
  async getCalendar(hallId: number) {
    const bookings = await prisma.bookings.findMany({
      where: { hall_id: hallId, status: 'booked' },
      select: {
        function_date: true,
        alloted_datetime_from: true,
        alloted_datetime_to: true,
        status: true,
      },
      orderBy: { function_date: 'asc' },
    });

    const peakHours = await prisma.peak_hours.findMany({
      where: { hall_id: hallId },
      select: {
        date: true,
        rent: true,
        reason: true,
      },
      orderBy: { date: 'asc' },
    });

    if (!bookings.length && !peakHours.length) {
      throw new NotFoundException(`No calendar entries found for hall ID ${hallId}`);
    }

    const calendar: Record<string, any> = {};

    // 🟢 Bookings (highest priority)
    bookings.forEach((b) => {
      const dateStr = b.function_date.toISOString().split('T')[0];
      calendar[dateStr] = calendar[dateStr] || { booked: [], peakHours: [], available: true };
      calendar[dateStr].booked.push({
        from: b.alloted_datetime_from,
        to: b.alloted_datetime_to,
        status: b.status,
      });
      calendar[dateStr].available = false;
    });

    // 🟡 Peak hours (if not booked, still mark unavailable)
    peakHours.forEach((p) => {
      const dateStr = p.date.toISOString().split('T')[0];
      calendar[dateStr] = calendar[dateStr] || { booked: [], peakHours: [], available: true };
      calendar[dateStr].peakHours.push({
        rent: p.rent,
        reason: p.reason,
      });
      calendar[dateStr].available = false;
    });

    return calendar;
  }

  // 📅 2. Booked dates only
  async getBookedOnly(hallId: number) {
    const bookings = await prisma.bookings.findMany({
      where: { hall_id: hallId , status: 'booked' },
      select: {
        function_date: true,
        alloted_datetime_from: true,
        alloted_datetime_to: true,
      },
      orderBy: { function_date: 'asc' },
    });

    if (!bookings.length) {
      throw new NotFoundException(`No bookings found for hall ID ${hallId}`);
    }

    return bookings.map((b) => ({
      date: b.function_date,
      from: b.alloted_datetime_from,
      to: b.alloted_datetime_to,
    }));
  }
}
