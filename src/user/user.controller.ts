import { Controller, Get, Post, Param, ParseIntPipe, Body} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':hallId')
  findAllByHall(@Param('hallId', ParseIntPipe) hallId: number) {
    return this.userService.findAllByHall(hallId);
  }

  @Get(':hallId/:userId')
  findOneByHall(
    @Param('hallId', ParseIntPipe) hallId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.userService.findOneByHall(hallId, userId);
  }
  @Post(':hallId/admin')
addAdmin(
  @Param('hallId', ParseIntPipe) hallId: number,
  @Body() dto: CreateUserDto,
) {
  return this.userService.addAdmin({ ...dto, hall_id: hallId });
}
}
