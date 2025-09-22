import { Controller, Get, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('admins')
export class UserFullController {
  constructor(private readonly userService: UserService) {}

  // GET /user-full/:hallId/:userId
  @Get(':hallId/:userId')
  getUserWithAdmin(
    @Param('hallId', ParseIntPipe) hallId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.userService.getUserWithAdmin(hallId, userId);
  }
  @Get(':hallId')
getAdminsByHall(@Param('hallId', ParseIntPipe) hallId: number) {
  return this.userService.getAdminsByHall(hallId);
}
@Delete(':hallId/admin/:userId')
deleteAdmin(
  @Param('hallId', ParseIntPipe) hallId: number,
  @Param('userId', ParseIntPipe) userId: number,
) {
  return this.userService.deleteAdmin(hallId, userId);
}
  
}
