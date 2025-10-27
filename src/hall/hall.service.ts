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
        dueDate:true,
        is_active: true, // include status
      },
    });

    return halls.map(this.toBase64);
  }

  // Get single hall by id
  // Get single hall by id, including block reasons
async findOne(id: number) {
  const hall = await prisma.hall.findUnique({
    where: { hall_id: id },
    include: {
      hallBlocks: { select: { reason: true } }, // fetch block reasons
    },
  });

  if (!hall) throw new NotFoundException(`Hall with ID ${id} not found`);

  // Convert logo to base64
  const hallWithBase64 = this.toBase64(hall);

  // Map block reasons into an array
  const blockReasons = hall.hallBlocks.map(b => b.reason);

  return {
    ...hallWithBase64,
    block_reasons: blockReasons, // add block reasons
  };
}


  // Create hall
  async createHall(createHallDto: CreateHallDto) {
    const { hall_id, name, phone, email, address, logo } = createHallDto;
    const logoBuffer = logo ? Buffer.from(logo, 'base64') : undefined;
      const now = new Date();
      const dueDate = new Date(now);
      dueDate.setMonth(dueDate.getMonth() + 3);

    const hall = await prisma.hall.create({
      data: {
        hall_id,
        name,
        phone,
        email,
        address,
        logo: logoBuffer,
        dueDate,
      },
    });

    return this.toBase64(hall);
  }

  // Update hall
  async updateHall(id: number, updateHallDto: UpdateHallDto) {
    const { name, phone, email, address, logo ,dueDate} = updateHallDto;

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
        dueDate: dueDate ? new Date(dueDate) : hall.dueDate, // allow dueDate edit
        logo: logoBuffer || hall.logo, // keep existing if no new logo
      },
      
    });

    return this.toBase64(updatedHall);
  }


  // Block/Unblock hall
async blockHall(id: number, block: boolean, reason?: string) {
  const hall = await prisma.hall.findUnique({ where: { hall_id: id } });
  if (!hall) throw new NotFoundException(`Hall with ID ${id} not found`);

  if (block) {
    if (!reason) throw new BadRequestException('Block reason is required');

    // Update hall to inactive and insert into hall_block
    const updatedHall = await prisma.$transaction(async (prisma) => {
      const hallBlock = await prisma.hall_block.create({
        data: {
          hall_id: id,
          reason,
        },
      });

      const hallUpdate = await prisma.hall.update({
        where: { hall_id: id },
        data: { is_active: false },
      });

      return hallUpdate;
    });

    return {
      message: `Hall has been blocked successfully`,
      hall: this.toBase64(updatedHall),
    };
  } else {
    // Unblock: set active and remove from hall_block
    const updatedHall = await prisma.$transaction(async (prisma) => {
      await prisma.hall_block.deleteMany({ where: { hall_id: id } });

      const hallUpdate = await prisma.hall.update({
        where: { hall_id: id },
        data: { is_active: true },
      });

      return hallUpdate;
    });

    return {
      message: `Hall has been unblocked successfully`,
      hall: this.toBase64(updatedHall),
    };
  }
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
    prisma.income.deleteMany({ where: { hall_id: Number(id) } }), // new
    prisma.hall_block.deleteMany({ where: { hall_id: Number(id) } }),
    prisma.default_values.deleteMany({ where: { hall_id: Number(id) } }),
    prisma.peak_hours.deleteMany({ where: { hall_id: Number(id) } }),
    prisma.bookings.deleteMany({ where: { hall_id: Number(id) } }),
    prisma.admin.deleteMany({ where: { hall_id: Number(id) } }),
    prisma.administrator.deleteMany({ where: { hall_id: Number(id) } }),
    prisma.user.deleteMany({ where: { hall_id: Number(id) } }),
    prisma.hall.delete({ where: { hall_id: Number(id) } }),
  ]);

  return { message: 'Hall and all related records deleted successfully' };
}

}
