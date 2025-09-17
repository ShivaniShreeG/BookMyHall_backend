import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class AdminService {
  // ====== Admin table ======

  // All admins for a hall
  async findAllAdminsByHall(hallId: number) {
    const admins = await prisma.admin.findMany({
      where: { hall_id: hallId },
      select: {
        id: true,
        hall_id: true,
        user_id: true,
        name: true,
        designation: true,
        phone: true,
        email: true,
      },
    });

    if (!admins.length) throw new NotFoundException(`No admins found for hall ID ${hallId}`);
    return admins;
  }

  // One admin by hall + user_id
  async findAdminByHall(hallId: number, userId: number) {
    const admin = await prisma.admin.findUnique({
      where: {
        hall_id_user_id: {
          hall_id: hallId,
          user_id: userId,
        },
      },
      select: {
        id: true,
        hall_id: true,
        user_id: true,
        name: true,
        designation: true,
        phone: true,
        email: true,
      },
    });

    if (!admin)
      throw new NotFoundException(`Admin with user ID ${userId} not found in hall ${hallId}`);
    return admin;
  }

  // ====== Administrator table ======

  // All administrators for a hall
  async findAllAdministratorsByHall(hallId: number) {
    const administrators = await prisma.administrator.findMany({
      where: { hall_id: hallId },
      select: {
        id: true,
        hall_id: true,
        user_id: true,
        name: true,
        phone: true,
        email: true,
      },
    });

    if (!administrators.length)
      throw new NotFoundException(`No administrators found for hall ID ${hallId}`);
    return administrators;
  }

  // One administrator by hall + user_id
  async findAdministratorByHall(hallId: number, userId: number) {
    const administrator = await prisma.administrator.findUnique({
      where: {
        hall_id_user_id: {
          hall_id: hallId,
          user_id: userId,
        },
      },
      select: {
        id: true,
        hall_id: true,
        user_id: true,
        name: true,
        phone: true,
        email: true,
      },
    });

    if (!administrator)
      throw new NotFoundException(
        `Administrator with user ID ${userId} not found in hall ${hallId}`,
      );
    return administrator;
  }
}
