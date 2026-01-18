import { Controller, Get, Param, ParseIntPipe, Post, Body, Delete, Patch, Query } from '@nestjs/common';
import { HallService } from './hall.service';
import { CreateHallDto } from './dto/create-hall.dto';
import { UpdateHallDto } from './dto/update-hall.dto';
import { BlockHallDto } from './dto/block-hall.dto';
import { CreatePeakHourAllDto } from './dto/create-peak-hour-all.dto';

@Controller('halls')
export class HallController {
  constructor(private readonly hallService: HallService) {}

  @Post('all-halls')
  createForAllHalls(@Body() dto: CreatePeakHourAllDto) {
    return this.hallService.createForAllHallsMultipleDates(dto);
  }

  // Get all halls
  @Get()
  findAll() {
    return this.hallService.findAll();
  }

  // Get single hall
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.hallService.findOne(id);
  }

  // Create hall
  @Post()
  create(@Body() createHallDto: CreateHallDto) {
    return this.hallService.createHall(createHallDto);
  }

  // Update hall
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHallDto: UpdateHallDto,
  ) {
    return this.hallService.updateHall(id, updateHallDto);
  }

  // Block/Unblock hall
  @Patch(':id/block')
block(
  @Param('id', ParseIntPipe) id: number,
  @Body() blockHallDto: BlockHallDto, // <- now receives body
) {
  const { block, reason } = blockHallDto;
  return this.hallService.blockHall(id, block, reason);
}

  // Delete hall
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.hallService.deleteHall(id);
  }
}
