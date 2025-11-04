import { Controller, Get, Post, Param, Body, Patch, Delete } from '@nestjs/common';
import { SubmitTicketService } from './submit.service';
import { CreateSubmitTicketDto } from './dto/create-submit.dto';
import { UpdateSubmitTicketDto } from './dto/update-submit.dto';

@Controller('submit-ticket')
export class SubmitTicketController {
  constructor(private readonly service: SubmitTicketService) {}

  @Post()
  create(@Body() dto: CreateSubmitTicketDto) {
    return this.service.create(dto);
  }

  @Get('hall/:hall_id')
  findAllByHall(@Param('hall_id') hall_id: string) {
    return this.service.findAllByHall(Number(hall_id));
  }
  
  @Get('all')
  findAll() {
    return this.service.findAll(); // must be implemented in service
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSubmitTicketDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
