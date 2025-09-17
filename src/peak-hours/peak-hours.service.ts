import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class PeakHoursService {

  async findAllByHall(hallId: number) {
    const peaks = await prisma.peak_hours.findMany({
      where: { hall_id: hallId },
      select: {
        id: true,
        hall_id: true,
        user_id: true,
        date: true,
        reason: true,
        rent: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: { date: 'asc' },
    });

    if (!peaks.length) throw new NotFoundException(`No peak hours found for hall ID ${hallId}`);
    return peaks;
  }

  async findByHallAndDate(hallId: number, dateStr: string) {
    const date = new Date(dateStr);

    const peak = await prisma.peak_hours.findUnique({
      where: {
        hall_id_date: {
          hall_id: hallId,
          date: date,
        },
      },
      select: {
        id: true,
        hall_id: true,
        user_id: true,
        date: true,
        reason: true,
        rent: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!peak)
      throw new NotFoundException(`No peak hour found for hall ID ${hallId} on date ${dateStr}`);
    return peak;
  }
}
