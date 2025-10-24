import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException
} from '@nestjs/common';
import { PrismaClient, Role } from '@prisma/client';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';

const prisma = new PrismaClient();

@Injectable()
export class UserService {
  async getAdminsByHall(hallId: number) {
  const admins = await prisma.admin.findMany({
    where: {
      hall_id: Number(hallId),
      user: { is_active: true }, // Only include admins with active users
    },
    include: {
      user: {
        select: {
          user_id: true,
          hall_id: true,
          role: true,
          is_active: true,
        },
      },
    },
  });

  return admins.map(a => ({
    user_id: a.user_id,
    designation: a.designation,
    name: a.name,
    phone: a.phone,
    email: a.email,
  }));
}
  
async deleteAdmin(hallId: number, userId: number) {
  const user = await prisma.user.findUnique({
    where: { hall_id_user_id: { hall_id: hallId, user_id: userId } },
  });

  if (!user) {
    throw new NotFoundException(`User with ID ${userId} not found in hall ${hallId}`);
  }

  // Soft delete by setting is_active to false
  await prisma.user.update({
    where: { hall_id_user_id: { hall_id: hallId, user_id: userId } },
    data: { is_active: false },
  });

  return { message: `User ${userId} deactivated successfully` };
}

  async getUserWithAdmin(hallId: number, userId: number) {
  const user = await prisma.user.findUnique({
    where: { hall_id_user_id: { hall_id: hallId, user_id: userId } },
    include: {   // use include to fetch relations
      hall: true,   // fetch full hall object
      admins: true, // fetch related Admin rows
    },
  });

  if (!user) {
    throw new NotFoundException(
      `User with ID ${userId} not found for hall ${hallId}`,
    );
  }

  // Optional: convert hall.logo to base64
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
    admins: user.admins.map(a => ({
      designation: a.designation,
      name: a.name,
      phone: a.phone,
      email: a.email,
    })),
  };
}

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
      hall: {
        select: {
          hall_id: true,
          name: true,
          is_active: true,
          logo: true,
          hallBlocks: { select: { reason: true } }, // fetch block reason
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundException(`User with ID ${userId} not found in hall ${hallId}`);
  }

  // Determine hall block reason if inactive
  let hallBlockReason = '';
  if (!user.hall?.is_active) {
    hallBlockReason =
      user.hall.hallBlocks.length > 0
        ? user.hall.hallBlocks[0].reason
        : 'Hall is inactive';
  }

  // Determine user block reason if inactive
  let userBlockReason = '';
  if (!user.is_active) {
    userBlockReason = 'Your user account has been deactivated';
  }

  // Convert hall.logo to base64 if present
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
    userBlockReason, // frontend can use this to show dialog
    hall: {
      hall_id: user.hall.hall_id,
      name: user.hall.name,
      is_active: user.hall.is_active,
      logo: logoBase64,
      hallBlockReason, // frontend can use this to show dialog
    },
  };
}


async login(hallId: number, userId: number, password: string) {
  try {
    // Fetch user and hall status
    const user = await prisma.user.findUnique({
      where: { hall_id_user_id: { hall_id: Number(hallId), user_id: Number(userId) } },
      select: {
        user_id: true,
        hall_id: true,
        password: true,
        role: true,
        is_active: true,
        hall: {
          select: { 
            is_active: true,
            hallBlocks: { select: { reason: true } }, // fetch block info
          },
        },
      },
    });

    if (!user) return { success: false, message: 'User not found' };

    // Check if hall is inactive
    if (!user.hall.is_active) {
      // Only fetch reason if hall is inactive
      const blockReason = user.hall.hallBlocks.length > 0
          ? user.hall.hallBlocks[0].reason
          : 'Hall is inactive';
      return {
        success: false,
        message: `Hall access denied. Reason: ${blockReason}`,
      };
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
 async sendOtp(hallId: number, userId: number, otp: string) {
    // Find the user's email from Admin table
    const admin = await prisma.admin.findUnique({
      where: { hall_id_user_id: { hall_id: hallId, user_id: userId } },
    });

    if (!admin || !admin.email) {
      throw new NotFoundException({ status: 'error', message: 'User email not found' });
    }

    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'Noreply.ramchintech@gmail.com', // Your Gmail
        pass: 'zkvb rmyu yqtm ipgv',           // Gmail App Password
      },
    });

    // Email options
    const mailOptions = {
      from: 'Noreply.ramchintech@gmail.com',
      to: admin.email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      return { status: 'success', message: 'OTP sent successfully' };
    } catch (error) {
      console.error('Email send error:', error);
      throw new BadRequestException({ status: 'error', message: 'Failed to send OTP' });
    }
  }

  // ✅ Update Password after OTP verification
  async updatePassword(hallId: number, userId: number, newPassword: string) {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { hall_id_user_id: { hall_id: hallId, user_id: userId } },
    });

    if (!user) {
      throw new NotFoundException({ status: 'error', message: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password in DB
    await prisma.user.update({
      where: { hall_id_user_id: { hall_id: hallId, user_id: userId } },
      data: { password: hashedPassword },
    });

    return { status: 'success', message: 'Password updated successfully' };
  }
}
