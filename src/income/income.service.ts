import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

const prisma = new PrismaClient();

@Injectable()
export class IncomeService {
  // Create
  async create(dto: CreateIncomeDto) {
    return prisma.income.create({ data: dto });
  }

  // Get all incomes for a hall
  async findAllByHall(hall_id: number) {
    return prisma.income.findMany({ where: { hall_id } });
  }

  // Get single income by id
  async findOne(id: number) {
    const income = await prisma.income.findUnique({ where: { id } });
    if (!income) throw new NotFoundException(`Income with ID ${id} not found`);
    return income;
  }

  // Update
  async update(id: number, dto: UpdateIncomeDto) {
    await this.findOne(id); // check if exists
    return prisma.income.update({
      where: { id },
      data: dto,
    });
  }

  // Delete
  async remove(id: number) {
    await this.findOne(id); // check if exists
    return prisma.income.delete({ where: { id } });
  }
}
