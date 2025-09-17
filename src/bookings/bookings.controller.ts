import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { BookingsService } from './bookings.service';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // GET /halls/:hallId/bookings → all bookings for a hall
  @Get(':hallId')
  findAllByHall(@Param('hallId', ParseIntPipe) hallId: number) {
    return this.bookingsService.findAllByHall(hallId);
  }

  // GET /halls/:hallId/bookings/:bookingId → specific booking
  @Get(':hallId/:bookingId')
  findOneByHall(
    @Param('hallId', ParseIntPipe) hallId: number,
    @Param('bookingId', ParseIntPipe) bookingId: number,
  ) {
    return this.bookingsService.findOneByHall(hallId, bookingId);
  }
  @Get(':hallId/month/:year/:month')
findByMonth(
  @Param('hallId', ParseIntPipe) hallId: number,
  @Param('year', ParseIntPipe) year: number,
  @Param('month', ParseIntPipe) month: number,
) {
  return this.bookingsService.findByMonth(hallId, month, year);
}

  // GET /halls/:hallId/bookings/date/:date → booking by function_date
  @Get(':hallId/date/:date')
  findByFunctionDate(
    @Param('hallId', ParseIntPipe) hallId: number,
    @Param('date') date: string,
  ) {
    return this.bookingsService.findByFunctionDate(hallId, date);
  }
}
