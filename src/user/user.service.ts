import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';

const prisma = new PrismaClient();

@Injectable()
export class UserService {
  async addAdmin(dto: CreateUserDto) {
    const hall = await prisma.hall.findUnique({ where: { hall_id: dto.hall_id } });
    if (!hall) throw new NotFoundException(`Hall with ID ${dto.hall_id} not found`);

    const existing = await prisma.user.findUnique({
      where: { hall_id_user_id: { hall_id: dto.hall_id, user_id: dto.user_id } },
    });
    if (existing) throw new ForbiddenException(`User ${dto.user_id} already exists for hall ${dto.hall_id}`);

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const newUser = await prisma.user.create({
      data: {
        hall_id: dto.hall_id,
        user_id: dto.user_id,
        password: hashedPassword,
        role: Role.admin, // ✅ force admin
        is_active: dto.is_active ?? true,
      },
      select: {
        user_id: true,
        hall_id: true,
        role: true,
        is_active: true,
      },
    });

    return { message: 'Admin user created successfully', user: newUser };
  }

  // ... your existing methods (findAllByHall, findOneByHall, login, etc.)

  // Fetch all users by hall
  async findAllByHall(hallId: number) {
    const users = await prisma.user.findMany({
      where: { hall_id: hallId },
      select: {
        user_id: true,
        hall_id: true,
        password: true,
        role: true,
        is_active: true,
      },
    });

    if (!users.length)
      throw new NotFoundException(`No users found for hall ID ${hallId}`);
    return users;
  }

  // Fetch single user by hall + user ID
  async findOneByHall(hallId: number, userId: number) {
    const user = await prisma.user.findUnique({
      where: {
        hall_id_user_id: { hall_id: hallId, user_id: userId },
      },
      select: {
        user_id: true,
        hall_id: true,
        password: true,
        role: true,
        is_active: true,
      },
    });

    if (!user)
      throw new NotFoundException(
        `User with ID ${userId} not found in hall ${hallId}`,
      );
    return user;
  }

  // Login method
  async login(hallId: number, userId: number, password: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { hall_id_user_id: { hall_id: Number(hallId), user_id: Number(userId) } },
        select: { user_id: true, hall_id: true, password: true, role: true, is_active: true },
      });

      if (!user) return { success: false, message: 'User not found' };
      if (!user.is_active) return { success: false, message: 'Account inactive' };
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return { success: false, message: 'Incorrect password' };
      if (![Role.admin, Role.administrator].includes(user.role)) {
        return { success: false, message: 'Access denied' };
      }

      return {
        success: true,
        message: 'Login successful',
        user: { hallId: user.hall_id, userId: user.user_id, role: user.role },
      };
    } catch (e) {
      console.error('Login error:', e);
      return { success: false, message: 'Internal server error' };
    }
  }

  // Create user helper (for seeding)
  async createUser(
    hallId: number,
    userId: number,
    rawPassword: string,
    role: Role,
  ) {
    const hashedPassword = await bcrypt.hash(rawPassword, 12);
    return prisma.user.create({
      data: {
        hall_id: hallId,
        user_id: userId,
        password: hashedPassword,
        role: role,
        is_active: true,
      },
    });
  }

  // Change password
  async changePassword(
    hallId: number,
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {
    // Fetch the user
    const user = await prisma.user.findUnique({
      where: { hall_id_user_id: { hall_id: hallId, user_id: userId } },
      select: { password: true },
    });

    if (!user) throw new NotFoundException('User not found');

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new ForbiddenException('Old password is incorrect');

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { hall_id_user_id: { hall_id: hallId, user_id: userId } },
      data: { password: hashed },
    });

    return { message: 'Password updated successfully' };
  }
}
