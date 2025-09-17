import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users/:hallId')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAllByHall(@Param('hallId', ParseIntPipe) hallId: number) {
    return this.userService.findAllByHall(hallId);
  }

  @Get(':userId')
  findOneByHall(
    @Param('hallId', ParseIntPipe) hallId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.userService.findOneByHall(hallId, userId);
  }
}
