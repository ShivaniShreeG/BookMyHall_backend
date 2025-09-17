import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class UserService {

  async findAllByHall(hallId: number) {
    const users = await prisma.user.findMany({
      where: { hall_id: hallId },
      select: {
        user_id: true,
        hall_id: true,
        password:true,
        role: true,
        is_active: true,
      },
    });

    if (!users.length) throw new NotFoundException(`No users found for hall ID ${hallId}`);
    return users;
  }

  async findOneByHall(hallId: number, userId: number) {
    const user = await prisma.user.findUnique({
      where: {
        hall_id_user_id: {
          hall_id: hallId,
          user_id: userId,
        },
      },
      select: {
        user_id: true,
        hall_id: true,
        password:true,
        role: true,
        is_active: true,
      },
    });

    if (!user) throw new NotFoundException(`User with ID ${userId} not found in hall ${hallId}`);
    return user;
  }
}
