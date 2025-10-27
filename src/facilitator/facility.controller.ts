import {Controller, Get, Post, Patch, Delete, Param, Body,} from '@nestjs/common';
import { FacilitatorService } from './facility.service';
import { CreateFacilitatorDto } from './dto/create-facilitator.dto';
import { UpdateFacilitatorDto } from './dto/update-facilitator.dto';

@Controller('facilitator')
export class FacilitatorController {
  constructor(private readonly facilitatorService: FacilitatorService) {}

  // ✅ Create a new facilitator
  @Post()
  async create(@Body() dto: CreateFacilitatorDto) {
    const data = await this.facilitatorService.create(dto);
    return {
      success: true,
      message: 'Facilitator created successfully',
      data,
    };
  }

  // ✅ Get all facilitators by hall_id
  @Get('hall/:hall_id')
  async findAllByHall(@Param('hall_id') hall_id: string) {
    const data = await this.facilitatorService.findAllByHall(Number(hall_id));
    return {
      success: true,
      message: 'Facilitators fetched successfully',
      data,
    };
  }

  // ✅ Get one facilitator by id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.facilitatorService.findOne(Number(id));
    return {
      success: true,
      message: 'Facilitator fetched successfully',
      data,
    };
  }

  // ✅ Update facilitator
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateFacilitatorDto) {
    const data = await this.facilitatorService.update(Number(id), dto);
    return {
      success: true,
      message: 'Facilitator updated successfully',
      data,
    };
  }

  // ✅ Delete facilitator
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.facilitatorService.remove(Number(id));
    return {
      success: true,
      message: 'Facilitator deleted successfully',
    };
  }
}
