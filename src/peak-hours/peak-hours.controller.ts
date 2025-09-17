import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PeakHoursService } from './peak-hours.service';

@Controller('peak-hour/:hallId/peaks')
export class PeakHoursController {
  constructor(private readonly peakHoursService: PeakHoursService) {}

  // GET /halls/:hallId/peaks → all peak hours for a hall
  @Get()
  findAllByHall(@Param('hallId', ParseIntPipe) hallId: number) {
    return this.peakHoursService.findAllByHall(hallId);
  }

  // GET /halls/:hallId/peaks/:date → specific peak hour by date
  @Get(':date')
  findByHallAndDate(
    @Param('hallId', ParseIntPipe) hallId: number,
    @Param('date') date: string,
  ) {
    return this.peakHoursService.findByHallAndDate(hallId, date);
  }
}
