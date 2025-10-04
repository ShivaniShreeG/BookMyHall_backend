import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateHallInstructionDto } from './dto/create-hall-instruction.dto';
import { UpdateHallInstructionDto } from './dto/update-hall-instruction.dto';

const prisma = new PrismaClient();

@Injectable()
export class HallInstructionsService {
  async findAllByHall(hallId: number) {
    return prisma.hallInstruction.findMany({
      where: { hall_id: hallId },
      orderBy: { created_at: 'asc' },
    });
  }

  async findOne(instructionId: number) {
    const instruction = await prisma.hallInstruction.findUnique({
      where: { id: instructionId },
    });
    if (!instruction) throw new NotFoundException(`Instruction ID ${instructionId} not found`);
    return instruction;
  }

  // Single create
  async create(dto: CreateHallInstructionDto) {
    return prisma.hallInstruction.create({
      data: {
        hall_id: dto.hall_id,
        instruction: dto.instruction.trim(),
      },
    });
  }

  // Multiple create
  async createMany(dtos: CreateHallInstructionDto[]) {
    const data = dtos.map(dto => ({
      hall_id: dto.hall_id,
      instruction: dto.instruction.trim(),
    }));

    const result = await prisma.hallInstruction.createMany({
      data,
      skipDuplicates: true, // avoid duplicates if same instruction
    });

    return { count: result.count };
  }

  async update(instructionId: number, dto: UpdateHallInstructionDto) {
    const instruction = await prisma.hallInstruction.findUnique({ where: { id: instructionId } });
    if (!instruction || instruction.hall_id !== dto.hall_id) {
      throw new NotFoundException(`Instruction ID ${instructionId} not found for hall ${dto.hall_id}`);
    }

    return prisma.hallInstruction.update({
      where: { id: instructionId },
      data: { instruction: dto.instruction?.trim() },
    });
  }

  async remove(instructionId: number, hallId: number) {
    const instruction = await prisma.hallInstruction.findUnique({ where: { id: instructionId } });
    if (!instruction || instruction.hall_id !== hallId) {
      throw new NotFoundException(`Instruction ID ${instructionId} not found for hall ${hallId}`);
    }

    return prisma.hallInstruction.delete({ where: { id: instructionId } });
  }
}
