import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateHallDto } from './dto/create-hall.dto';
import { UpdateHallDto } from './dto/update-hall.dto'; // we'll create this DTO

const prisma = new PrismaClient();

@Injectable()
export class HallService {

  // Convert hall logo buffer to base64
  private toBase64(hall: any) {
    if (hall?.logo) {
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
        is_active: true, // include status
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
        is_active: true,
      },
    });

    if (!hall) throw new NotFoundException(`Hall with ID ${id} not found`);

    return this.toBase64(hall);
  }

  // Create hall
  async createHall(createHallDto: CreateHallDto) {
    const { hall_id, name, phone, email, address, logo } = createHallDto;
    const logoBuffer = logo ? Buffer.from(logo, 'base64') : undefined;

    const hall = await prisma.hall.create({
      data: {
        hall_id,
        name,
        phone,
        email,
        address,
        logo: logoBuffer,
      },
    });

    return this.toBase64(hall);
  }

  // Update hall
  async updateHall(id: number, updateHallDto: UpdateHallDto) {
    const { name, phone, email, address, logo } = updateHallDto;

    // check if hall exists
    const hall = await prisma.hall.findUnique({ where: { hall_id: id } });
    if (!hall) throw new NotFoundException(`Hall with ID ${id} not found`);

    const logoBuffer = logo ? Buffer.from(logo, 'base64') : undefined;

    const updatedHall = await prisma.hall.update({
      where: { hall_id: id },
      data: {
        name,
        phone,
        email,
        address,
        logo: logoBuffer || hall.logo, // keep existing if no new logo
      },
    });

    return this.toBase64(updatedHall);
  }

  // Block/Unblock hall
  async blockHall(id: number, block: boolean) {
    const hall = await prisma.hall.findUnique({ where: { hall_id: id } });
    if (!hall) throw new NotFoundException(`Hall with ID ${id} not found`);

    const updatedHall = await prisma.hall.update({
      where: { hall_id: id },
      data: {
        is_active: !block ? true : false,
      },
    });

    return {
      message: `Hall has been ${block ? 'blocked' : 'unblocked'} successfully`,
      hall: this.toBase64(updatedHall),
    };
  }

  // Delete hall
  async deleteHall(id: number) {
    const hall = await prisma.hall.findUnique({ where: { hall_id: Number(id) } });
    if (!hall) throw new NotFoundException(`Hall with ID ${id} not found`);

    await prisma.$transaction([
      prisma.cancel.deleteMany({ where: { hall_id: Number(id) } }),
      prisma.charges.deleteMany({ where: { hall_id: Number(id) } }),
      prisma.billing.deleteMany({ where: { hall_id: Number(id) } }),
      prisma.expense.deleteMany({ where: { hall_id: Number(id) } }),
      prisma.hall_block.deleteMany({ where: { hall_id: Number(id) } }),
      prisma.default_values.deleteMany({ where: { hall_id: Number(id) } }),
      prisma.bookings.deleteMany({ where: { hall_id: Number(id) } }),
      prisma.admin.deleteMany({ where: { hall_id: Number(id) } }),
      prisma.administrator.deleteMany({ where: { hall_id: Number(id) } }),
      prisma.peak_hours.deleteMany({ where: { hall_id: Number(id) } }),
      prisma.user.deleteMany({ where: { hall_id: Number(id) } }),
      prisma.hall.delete({ where: { hall_id: Number(id) } }),
    ]);

    return { message: 'Hall and all related records deleted successfully' };
  }
}
