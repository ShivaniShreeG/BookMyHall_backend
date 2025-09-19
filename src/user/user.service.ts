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
  async addAdmin(dto: CreateUserDto & { designation: string; name?: string; phone?: string; email?: string }) {
  const hall = await prisma.hall.findUnique({ where: { hall_id: dto.hall_id } });
  if (!hall) throw new NotFoundException(`Hall with ID ${dto.hall_id} not found`);

  const existing = await prisma.user.findUnique({
    where: { hall_id_user_id: { hall_id: dto.hall_id, user_id: dto.user_id } },
  });
  if (existing) throw new ForbiddenException(`User ${dto.user_id} already exists for hall ${dto.hall_id}`);

  const hashedPassword = await bcrypt.hash(dto.password, 12);

  const [newUser, newAdmin] = await prisma.$transaction([
    prisma.user.create({
      data: {
        hall_id: dto.hall_id,
        user_id: dto.user_id,
        password: hashedPassword,
        role: Role.admin,
        is_active: dto.is_active ?? true,
      },
      select: {
        user_id: true,
        hall_id: true,
        role: true,
        is_active: true,
      },
    }),
    prisma.admin.create({
      data: {
        hall_id: dto.hall_id,
        user_id: dto.user_id,
        designation: dto.designation,
        name: dto.name ?? '',
        phone: dto.phone ?? '',
        email: dto.email ?? '',
      },
    }),
  ]);

  return { message: 'Admin user created successfully', user: newUser, admin: newAdmin };
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
  // Fetch single user by hall + user ID with hall check
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
      hall: {   // join hall info
        select: {
          hall_id: true,
          name: true,
          is_active: true,
          logo: true, // optional: can convert to base64 if needed
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundException(`User with ID ${userId} not found in hall ${hallId}`);
  }

  // Check if hall is active
  if (!user.hall?.is_active) {
    throw new ForbiddenException(`Hall with ID ${hallId} is inactive.`);
  }

  // Optional: convert hall.logo to base64 for API response
  let logoBase64: string | null = null;
  if (user.hall?.logo) {
    const buf = user.hall.logo instanceof Buffer
      ? user.hall.logo
      : Buffer.from(Object.values(user.hall.logo));
    logoBase64 = buf.toString('base64');
  }

  return {
    user_id: user.user_id,
    hall_id: user.hall_id,
    role: user.role,
    is_active: user.is_active,
    hall: {
      hall_id: user.hall.hall_id,
      name: user.hall.name,
      is_active: user.hall.is_active,
      logo: logoBase64,
    },
  };
}

  
  // Login method
  // Login method
async login(hallId: number, userId: number, password: string) {
  try {
    // Fetch user + hall together
    const user = await prisma.user.findUnique({
      where: { hall_id_user_id: { hall_id: Number(hallId), user_id: Number(userId) } },
      select: {
        user_id: true,
        hall_id: true,
        password: true,
        role: true,
        is_active: true,
        hall: {   // 👈 join hall
          select: { is_active: true },
        },
      },
    });

    if (!user) return { success: false, message: 'User not found' };

    // Check hall status
    if (!user.hall.is_active) {
      return { success: false, message: 'Hall is inactive. Contact Owner.' };
    }

    // Check user status
    if (!user.is_active) {
      return { success: false, message: 'Account inactive' };
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return { success: false, message: 'Incorrect password' };

    // Role check
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
