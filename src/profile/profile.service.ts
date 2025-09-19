import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto'; 

const prisma = new PrismaClient();

@Injectable()
export class ProfileService {

  // Helper to convert hall logo to base64
  private toBase64(profile: any) {
    if (profile?.hall?.logo) {
      return {
        ...profile,
        hall: {
          ...profile.hall,
          // Convert Buffer to base64 string
          logo: Buffer.from(profile.hall.logo).toString('base64'),
        },
      };
    }
    return profile;
  }

  // Generic method to fetch profile
  private async getProfile(
    role: 'admin' | 'administrator',
    hallId: number,
    userId: number,
  ) {
    let record;

    if (role === 'admin') {
      record = await prisma.admin.findUnique({
        where: { hall_id_user_id: { hall_id: hallId, user_id: userId } },
        select: {
          id: true,
          name: true,
          designation: true,
          phone: true,
          email: true,
          hall: { select: { logo: true, name: true } },
        },
      });

      if (!record) throw new NotFoundException(`Admin not found in hall ${hallId}`);

      return this.toBase64({
        role: 'admin',
        name: record.name,
        designation: record.designation,
        phone: record.phone,
        email: record.email,
        hall: record.hall,
      });
    } else {
      record = await prisma.administrator.findUnique({
        where: { hall_id_user_id: { hall_id: hallId, user_id: userId } },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          hall: { select: { logo: true, name: true } },
        },
      });

      if (!record)
        throw new NotFoundException(`Administrator not found in hall ${hallId}`);

      return this.toBase64({
        role: 'administrator',
        name: record.name,
        phone: record.phone,
        email: record.email,
        hall: record.hall,
      });
    }
  }
  async updateProfile(role: 'admin' | 'administrator', hallId: number, userId: number, dto: UpdateProfileDto) {
  if (role === 'admin') {
    const existing = await prisma.admin.findUnique({
      where: { hall_id_user_id: { hall_id: hallId, user_id: userId } },
    });

    if (existing) {
      const updated = await prisma.admin.update({
        where: { hall_id_user_id: { hall_id: hallId, user_id: userId } },
        data: {
          name: dto.name ?? existing.name,
          phone: dto.phone ?? existing.phone,
          email: dto.email ?? existing.email,
          // designation is NOT updated
        },
      });
      return this.getProfile(role, hallId, userId);
    } else {
      await prisma.admin.create({
        data: {
          hall_id: hallId,
          user_id: userId,
          name: dto.name ?? '',
          phone: dto.phone ?? '',
          email: dto.email ?? '',
          designation: '', // set default or keep empty
        },
      });
      return this.getProfile(role, hallId, userId);
    }
  } else {
    const existing = await prisma.administrator.findUnique({
      where: { hall_id_user_id: { hall_id: hallId, user_id: userId } },
    });

    if (existing) {
      await prisma.administrator.update({
        where: { hall_id_user_id: { hall_id: hallId, user_id: userId } },
        data: {
          name: dto.name ?? existing.name,
          phone: dto.phone ?? existing.phone,
          email: dto.email ?? existing.email,
        },
      });
    } else {
      await prisma.administrator.create({
        data: {
          hall_id: hallId,
          user_id: userId,
          name: dto.name ?? '',
          phone: dto.phone ?? '',
          email: dto.email ?? '',
        },
      });
    }
    return this.getProfile(role, hallId, userId);
  }
}

  // Public methods
  getAdminProfile(hallId: number, userId: number) {
    return this.getProfile('admin', hallId, userId);
  }

  getAdministratorProfile(hallId: number, userId: number) {
    return this.getProfile('administrator', hallId, userId);
  }
}
