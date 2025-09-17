import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class HallService {
  
  private toBase64(hall: any) {
    if (hall && hall.logo) {
      return {
        ...hall,
        logo: hall.logo.toString('base64'), 
      };
    }
    return hall;
  }

  async findAll() {
    const halls = await prisma.hall.findMany({
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

 
  async findOne(id: number) {
    const hall = await prisma.hall.findUnique({
      where: { hall_id: Number(id) },
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
    return this.toBase64(hall);
  }
}
