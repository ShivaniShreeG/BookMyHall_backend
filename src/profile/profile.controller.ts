import { Controller, Get, Param, NotFoundException, ParseIntPipe } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // GET /api/profile/:role/:hallId/:userId
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
}
