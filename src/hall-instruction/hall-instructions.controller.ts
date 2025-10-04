import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { HallInstructionsService } from './hall-instructions.service';
import { CreateHallInstructionDto } from './dto/create-hall-instruction.dto';
import { UpdateHallInstructionDto } from './dto/update-hall-instruction.dto';

@Controller('instructions')
export class HallInstructionsController {
  constructor(private readonly instructionsService: HallInstructionsService) {}

  @Get('hall/:hallId')
  async findAll(@Param('hallId', ParseIntPipe) hallId: number) {
    return this.instructionsService.findAllByHall(hallId);
  }

  @Get(':instructionId')
  async findOne(@Param('instructionId', ParseIntPipe) instructionId: number) {
    return this.instructionsService.findOne(instructionId);
  }

  // Single create
  @Post()
  async create(@Body() dto: CreateHallInstructionDto) {
    return this.instructionsService.create(dto);
  }

  // Multiple create
  @Post('bulk')
  async createMany(@Body() dtos: CreateHallInstructionDto[]) {
    return this.instructionsService.createMany(dtos);
  }

  @Patch(':instructionId')
  async update(
    @Param('instructionId', ParseIntPipe) instructionId: number,
    @Body() dto: UpdateHallInstructionDto,
  ) {
    return this.instructionsService.update(instructionId, dto);
  }

  @Delete(':instructionId/hall/:hallId')
  async remove(
    @Param('instructionId', ParseIntPipe) instructionId: number,
    @Param('hallId', ParseIntPipe) hallId: number,
  ) {
    return this.instructionsService.remove(instructionId, hallId);
  }
}
