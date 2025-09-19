import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateHallDto } from './dto/create-hall.dto';

const prisma = new PrismaClient();

@Injectable()
export class HallService {

  // Convert hall logo buffer to base64 like ProfileService
  private toBase64(hall: any) {
  if (hall?.logo) {
    // Ensure we have a Buffer and convert to base64 string
    const buffer =
      hall.logo instanceof Buffer
        ? hall.logo
        : Buffer.from(Object.values(hall.logo));
    return {
      ...hall,
      logo: buffer.toString('base64'),
    };
  }
  return hall;
}

  // Get all halls
  async findAll() {
    const halls = await prisma.hall.findMany({
      where: { hall_id: { not: 0 } },
      select: {
        hall_id: true,
        name: true,
        phone: true,
        email: true,
        address: true,
        logo: true,
      },
    });

    return halls.map(this.toBase64);
  }

  // Get single hall by id
  async findOne(id: number) {
    const hall = await prisma.hall.findUnique({
      where: { hall_id: id },
      select: {
        hall_id: true,
        name: true,
        phone: true,
        email: true,
        address: true,
        logo: true,
      },
    });

    if (!hall) throw new NotFoundException(`Hall with ID ${id} not found`);

    return this.toBase64(hall); // ✅ converts logo to Base64
  }
  async createHall(createHallDto: CreateHallDto) {
  const { hall_id, name, phone, email, address, logo } = createHallDto;
  const logoBuffer = logo ? Buffer.from(logo, 'base64') : undefined;

  const hall = await prisma.hall.create({
    data: {
      hall_id,   // use user-provided hall_id
      name,
      phone,
      email,
      address,
      logo: logoBuffer,
    },
  });

  return this.toBase64(hall);
}



async deleteHall(id: number) {
  const hall = await prisma.hall.findUnique({ where: { hall_id: Number(id) } });
  if (!hall) throw new NotFoundException(`Hall with ID ${id} not found`);

  await prisma.$transaction([
    // Step 1: children of bookings
    prisma.cancel.deleteMany({ where: { hall_id: Number(id) } }),
    prisma.charges.deleteMany({ where: { hall_id: Number(id) } }),
    prisma.billing.deleteMany({ where: { hall_id: Number(id) } }),

    // Step 2: other children directly under hall
    prisma.expense.deleteMany({ where: { hall_id: Number(id) } }),
    prisma.hall_block.deleteMany({ where: { hall_id: Number(id) } }),
    prisma.default_values.deleteMany({ where: { hall_id: Number(id) } }),

    // Step 3: bookings
    prisma.bookings.deleteMany({ where: { hall_id: Number(id) } }),

    // Step 4: admins & administrators
    prisma.admin.deleteMany({ where: { hall_id: Number(id) } }),
    prisma.administrator.deleteMany({ where: { hall_id: Number(id) } }),

    // Step 5: peak hours
    prisma.peak_hours.deleteMany({ where: { hall_id: Number(id) } }),

    // Step 6: users
    prisma.user.deleteMany({ where: { hall_id: Number(id) } }),

    // Step 7: finally hall
    prisma.hall.delete({ where: { hall_id: Number(id) } }),
  ]);

  return { message: 'Hall and all related records deleted successfully' };
}


}
