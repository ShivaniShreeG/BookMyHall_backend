import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateDefaultValueDto } from './dto/create-default-value.dto';
import { UpdateDefaultValueDto } from './dto/update-default-value.dto';

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
  async createDefault(hallId: number, dto: CreateDefaultValueDto) {
    // Optional: check hall exists
    const hallExists = await prisma.hall.findUnique({ where: { hall_id: hallId } });
    if (!hallExists) throw new NotFoundException(`Hall with ID ${hallId} not found`);

    return prisma.default_values.create({
      data: {
        hall_id: hallId,
        user_id: dto.userId,
        reason: dto.reason,
        amount: dto.amount,
      },
    });
  }
  async updateDefault(defaultId: number, dto: UpdateDefaultValueDto) {
  // Find existing default value by ID
  const existing = await prisma.default_values.findUnique({ 
    where: { id: defaultId } 
  });
  if (!existing) 
    throw new NotFoundException(`Default value with ID ${defaultId} not found`);

  // If userId is provided, validate that the user exists in the same hall
  if (dto.userId) {
    const userExists = await prisma.user.findFirst({
      where: {
        hall_id: existing.hall_id, // must be in the same hall
        user_id: dto.userId,
      },
    });
    if (!userExists) 
      throw new NotFoundException(`User with ID ${dto.userId} not found in hall ID ${existing.hall_id}`);
  }

  // Update the default value
  return prisma.default_values.update({
    where: { id: defaultId },
    data: {
      user_id: dto.userId ?? existing.user_id,
      reason: dto.reason ?? existing.reason,
      amount: dto.amount ?? existing.amount,
    },
  });
}
  async deleteDefault(defaultId: number) {
    const existing = await prisma.default_values.findUnique({ where: { id: defaultId } });
    if (!existing) throw new NotFoundException(`Default value with ID ${defaultId} not found`);

    await prisma.default_values.delete({ where: { id: defaultId } });
    return { message: `Default value with ID ${defaultId} deleted successfully` };
  }
}
