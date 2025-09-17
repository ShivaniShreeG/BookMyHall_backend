import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { HallService } from './hall.service';

@Controller('halls')
export class HallController {
  constructor(private readonly hallService: HallService) {}

  @Get()
  findAll() {
    return this.hallService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.hallService.findOne(id);
  }
}
