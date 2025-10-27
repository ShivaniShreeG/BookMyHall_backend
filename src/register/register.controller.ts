import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { RegisterService } from './register.service';
import { CreateHallOwnerDto } from './dto/create-hall.dto';

@Controller('register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @Post('create')
  async createHallWithOwner(@Body() dto: CreateHallOwnerDto) {
    return this.registerService.createHallWithOwner(dto);
  }
  // register.controller.ts
@Get('check-hall/:hall_id')
async checkHallExists(@Param('hall_id') hall_id: number) {
  const hall = await this.registerService.findHallById(+hall_id);
  return { exists: !!hall };
}

}
