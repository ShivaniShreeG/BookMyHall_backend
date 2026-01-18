import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreatePeakHourDto } from './dto/create-peak-hour.dto';

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

  // New create method
  async create(dto: CreatePeakHourDto) {
    const peak = await prisma.peak_hours.create({
      data: {
        hall_id: dto.hall_id,
        user_id: dto.user_id,
        date: new Date(dto.date),
        reason: dto.reason ?? '',
        rent: dto.rent,
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

    return peak;
  }
   async delete(hallId: number, peakHourId: number) {
    // Check if the peak hour exists
    const peak = await prisma.peak_hours.findUnique({
      where: { id: peakHourId },
    });

    if (!peak || peak.hall_id !== hallId) {
      throw new NotFoundException(`Peak hour with ID ${peakHourId} not found for hall ID ${hallId}`);
    }

    // Delete the peak hour
    await prisma.peak_hours.delete({
      where: { id: peakHourId },
    });

    return { message: `Peak hour ${peakHourId} deleted successfully` };
  }
}
