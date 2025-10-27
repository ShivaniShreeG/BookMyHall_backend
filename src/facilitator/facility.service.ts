import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateFacilitatorDto } from './dto/create-facilitator.dto';
import { UpdateFacilitatorDto } from './dto/update-facilitator.dto';

const prisma = new PrismaClient();

@Injectable()
export class FacilitatorService {
  // Create new facilitator
  async create(dto: CreateFacilitatorDto) {
    return prisma.facilitator.create({ data: dto });
  }

  // Get all facilitators for a specific hall
  async findAllByHall(hall_id: number) {
    return prisma.facilitator.findMany({ where: { hall_id } });
  }

  // Get a single facilitator by ID
  async findOne(id: number) {
    const facilitator = await prisma.facilitator.findUnique({ where: { id } });
    if (!facilitator)
      throw new NotFoundException(`Facilitator with ID ${id} not found`);
    return facilitator;
  }

  // Update facilitator details
  async update(id: number, dto: UpdateFacilitatorDto) {
    await this.findOne(id); // Check existence
    return prisma.facilitator.update({
      where: { id },
      data: dto,
    });
  }

  // Delete facilitator
  async remove(id: number) {
    await this.findOne(id); // Check existence
    return prisma.facilitator.delete({ where: { id } });
  }
}
