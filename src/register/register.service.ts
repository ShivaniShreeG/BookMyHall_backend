import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateHallOwnerDto } from './dto/create-hall.dto';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

@Injectable()
export class RegisterService {
  async createHallWithOwner(dto: CreateHallOwnerDto) {
    const {
      hall_name,
      hall_phone,
      hall_email,
      hall_address,
      user_id,
      hall_id,
      password,
      owner_name,
      owner_phone,
      owner_email,
      hall_logo,
    } = dto;

    const logoBuffer = hall_logo ? Buffer.from(hall_logo, 'base64') : undefined;

    // ✅ 1. Check if hall already exists
    const existingHall = await prisma.hall.findFirst({
      where: { name: hall_name, address: hall_address },
    });

    if (existingHall) {
      throw new BadRequestException('Hall already exists with same name & address');
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    // ✅ 2. Create hall, user, and owner (admin) in one transaction
    return prisma.$transaction(async (tx) => {
        const now = new Date();
      const dueDate = new Date(now);
      dueDate.setMonth(dueDate.getMonth() + 3);
      // Create Hall
      const hall = await tx.hall.create({
        data: {
          hall_id,
          name: hall_name,
          phone: hall_phone,
          email: hall_email,
          address: hall_address,
          logo: logoBuffer,
          dueDate,
        },
      });

      // Create User
      const user = await tx.user.create({
        data: {
          user_id,
          hall_id: hall.hall_id,
          password:hashedPassword,
          is_active: true,
          role: 'admin',
        },
      });

      // Create Admin (OWNER)
      const admin = await tx.admin.create({
        data: {
          hall_id: hall.hall_id,
          user_id: user.user_id,
          name: owner_name,
          phone: owner_phone,
          email: owner_email,
          designation: 'Owner', // Always uppercase
        },
      });

      return {
        message: 'Hall and Owner created successfully',
        hall,
        user,
        admin,
      };
    });
  }
  async findHallById(hall_id: number) {
  return prisma.hall.findUnique({ where: { hall_id } });
}

}
