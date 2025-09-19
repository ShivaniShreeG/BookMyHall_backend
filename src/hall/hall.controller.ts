import { Controller, Get, Param, ParseIntPipe, Post, Body, Delete } from '@nestjs/common';
import { HallService } from './hall.service';
import { CreateHallDto } from './dto/create-hall.dto';

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

  // ✅ Create hall
  @Post()
  create(@Body() createHallDto: CreateHallDto) {
    return this.hallService.createHall(createHallDto);
  }

  // ✅ Delete hall
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.hallService.deleteHall(id);
  }
}
