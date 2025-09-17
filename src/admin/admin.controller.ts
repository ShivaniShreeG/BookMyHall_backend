import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('profile')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get(':hallId/admins')
  findAllAdmins(@Param('hallId', ParseIntPipe) hallId: number) {
    return this.adminService.findAllAdminsByHall(hallId);
  }

  @Get(':hallId/admins/:userId')
  findAdmin(
    @Param('hallId', ParseIntPipe) hallId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.adminService.findAdminByHall(hallId, userId);
  }


  @Get(':hallId/administrators')
  findAllAdministrators(@Param('hallId', ParseIntPipe) hallId: number) {
    return this.adminService.findAllAdministratorsByHall(hallId);
  }

  @Get(':hallId/administrators/:userId')
  findAdministrator(
    @Param('hallId', ParseIntPipe) hallId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.adminService.findAdministratorByHall(hallId, userId);
  }
}
