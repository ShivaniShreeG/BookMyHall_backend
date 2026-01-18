import { Body,Controller, Get, Post, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { PeakHoursService } from './peak-hours.service';
import { CreatePeakHourDto } from './dto/create-peak-hour.dto';

@Controller('peak-hour/:hallId')
export class PeakHoursController {
  constructor(private readonly peakHoursService: PeakHoursService) {}

  
  // GET /halls/:hallId/peaks → all peak hours for a hall
  @Get()
  findAllByHall(@Param('hallId', ParseIntPipe) hallId: number) {
    return this.peakHoursService.findAllByHall(hallId);
  }
  // POST /peak-hour → create a new peak hour
@Post()
create(@Body() dto: CreatePeakHourDto) {
  return this.peakHoursService.create(dto);
}

  // GET /halls/:hallId/peaks/:date → specific peak hour by date
  @Get(':date')
  findByHallAndDate(
    @Param('hallId', ParseIntPipe) hallId: number,
    @Param('date') date: string,
  ) {
    return this.peakHoursService.findByHallAndDate(hallId, date);
  }
   @Delete(':id')
  async deletePeakHour(
    @Param('hallId', ParseIntPipe) hallId: number,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.peakHoursService.delete(hallId, id);
  }
}
