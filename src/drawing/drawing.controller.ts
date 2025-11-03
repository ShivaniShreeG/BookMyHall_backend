import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { DrawingService } from './drawing.service';
import { CreateDrawingDto } from './dto/create-drawing.dto';
import { UpdateDrawingDto } from './dto/update-drawing.dto';

@Controller('drawing')
export class DrawingController {
  constructor(private readonly drawingService: DrawingService) {}

  @Post()
  create(@Body() dto: CreateDrawingDto) {
    return this.drawingService.create(dto);
  }

  @Get('hall/:hallId')
  findAllByHall(@Param('hallId') hallId: number) {
    return this.drawingService.findAllByHall(Number(hallId));
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.drawingService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateDrawingDto) {
    return this.drawingService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.drawingService.remove(Number(id));
  }
}
