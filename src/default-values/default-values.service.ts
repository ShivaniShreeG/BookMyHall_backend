import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class DefaultValuesService {
  // 1️⃣ All default values for a hall
  async findAllByHall(hallId: number) {
    const defaults = await prisma.default_values.findMany({
      where: { hall_id: hallId },
      select: {
        id: true,
        hall_id: true,
        user_id: true,
        reason: true,
        amount: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: { created_at: 'asc' },
    });

    if (!defaults.length)
      throw new NotFoundException(`No default values found for hall ID ${hallId}`);
    return defaults;
  }

  // 2️⃣ Default values for a specific user in a hall
  async findByHallAndUser(hallId: number, userId: number) {
    const defaults = await prisma.default_values.findMany({
      where: { hall_id: hallId, user_id: userId },
      select: {
        id: true,
        hall_id: true,
        user_id: true,
        reason: true,
        amount: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: { created_at: 'asc' },
    });

    if (!defaults.length)
      throw new NotFoundException(
        `No default values found for hall ID ${hallId} and user ID ${userId}`,
      );
    return defaults;
  }
}
