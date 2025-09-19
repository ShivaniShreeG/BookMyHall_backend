import { Controller, Get, Put, Param, Body, NotFoundException, ParseIntPipe } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // GET /profile/:role/:hallId/:userId
  @Get(':role/:hallId/:userId')
  async getProfile(
    @Param('role') role: string,
    @Param('hallId', ParseIntPipe) hallId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    if (role === 'admin') {
      return this.profileService.getAdminProfile(hallId, userId);
    } else if (role === 'administrator') {
      return this.profileService.getAdministratorProfile(hallId, userId);
    } else {
      throw new NotFoundException(`Role "${role}" not recognized`);
    }
  }

  // PUT /profile/:role/:hallId/:userId
  @Put(':role/:hallId/:userId')
  async updateProfile(
    @Param('role') role: string,
    @Param('hallId', ParseIntPipe) hallId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateProfileDto,
  ) {
    if (role !== 'admin' && role !== 'administrator') {
      throw new NotFoundException(`Role "${role}" not recognized`);
    }

    return this.profileService.updateProfile(role as 'admin' | 'administrator', hallId, userId, dto);
  }
}
