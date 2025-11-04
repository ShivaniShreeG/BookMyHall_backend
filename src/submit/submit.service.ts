import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateSubmitTicketDto } from './dto/create-submit.dto';
import { UpdateSubmitTicketDto } from './dto/update-submit.dto';

const prisma = new PrismaClient();

@Injectable()
export class SubmitTicketService {
  // Create a new ticket
  async create(dto: CreateSubmitTicketDto) {
    return prisma.submitTicket.create({ data: dto });
  }

  // Get all tickets for a hall
  async findAllByHall(hall_id: number) {
    return prisma.submitTicket.findMany({
      where: { hall_id },
      orderBy: { created_at: 'desc' },
    });
  }

  // Get single ticket by ID
  async findOne(id: number) {
    const ticket = await prisma.submitTicket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException(`Ticket with ID ${id} not found`);
    return ticket;
  }

  // Update a ticket
  async update(id: number, dto: UpdateSubmitTicketDto) {
    await this.findOne(id);
    return prisma.submitTicket.update({ where: { id }, data: dto });
  }

  // Delete a ticket
  async remove(id: number) {
    await this.findOne(id);
    return prisma.submitTicket.delete({ where: { id } });
  }
}
