import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateSubmitTicketDto } from './dto/create-submit.dto';
import { UpdateSubmitTicketDto } from './dto/update-submit.dto';
import * as nodemailer from 'nodemailer';

const prisma = new PrismaClient();

@Injectable()
export class SubmitTicketService {
  // Create a new ticket
  async create(dto: CreateSubmitTicketDto) {
  // 1️⃣ Existing working ticket creation (leave as is)
  const ticket = await prisma.submitTicket.create({ data: dto });

  // 2️⃣ Fetch admin details (the one who submitted)
  const admin = await prisma.admin.findFirst({
    where: {
      hall_id: dto.hall_id,
      user_id: dto.user_id,
    },
  });

  if (!admin) {
    console.warn('⚠️ Admin not found for hall_id:', dto.hall_id, 'user_id:', dto.user_id);
    return ticket; // still return success without breaking
  }

  // 3️⃣ Set up Nodemailer
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'Noreply.ramchintech@gmail.com',
      pass: 'zkvb rmyu yqtm ipgv',
    },
  });

  // 4️⃣ Send email to main admin
  await transporter.sendMail({
    from: '"Marriage Hall Ticket System" <Noreply.ramchintech@gmail.com>',
    to: 'ramchintech@gmail.com', // main admin inbox
    subject: `🎫 New Ticket from ${admin.name}`,
    html: `
      <h2>New Ticket Submitted</h2>
      <p><strong>Hall ID:</strong> ${dto.hall_id}</p>
      <p><strong>User ID:</strong> ${dto.user_id}</p>
      <p><strong>Name:</strong> ${admin.name}</p>
      <p><strong>Email:</strong> ${admin.email}</p>
      <p><strong>Phone:</strong> ${admin.phone}</p>
      <p><strong>Issue:</strong> ${dto.issue}</p>
      <p><strong>Submitted At:</strong> ${ticket.created_at}</p>
    `,
  });

  // 5️⃣ Send confirmation to the same admin who submitted
  await transporter.sendMail({
    from: '"Marriage Hall Ticket System" <Noreply.ramchintech@gmail.com>',
    to: admin.email,
    subject: '✅ Ticket Submitted Successfully',
    html: `
      <h3>Dear ${admin.name},</h3>
      <p>Your ticket has been successfully submitted.</p>
      <p><strong>Issue:</strong> ${dto.issue}</p>
      <p>We will review your request and respond shortly.</p>
      <p>Thank you!</p>
    `,
  });

  return {
    message: 'Ticket submitted successfully and emails sent.',
    ticket,
  };
}

async findAll() {
  return prisma.submitTicket.findMany({
    orderBy: { created_at: 'desc' }, // optional: newest first
  });
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
