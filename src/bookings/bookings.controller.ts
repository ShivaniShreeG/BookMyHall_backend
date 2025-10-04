import { Controller, Get, Param, Patch, ParseIntPipe, Post, Body } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get(':hallId')
  findAllByHall(@Param('hallId', ParseIntPipe) hallId: number) {
    return this.bookingsService.findAllByHall(hallId);
  }

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

  @Get(':hallId/date/:date')
  findByFunctionDate(
    @Param('hallId', ParseIntPipe) hallId: number,
    @Param('date') date: string,
  ) {
    return this.bookingsService.findByFunctionDate(hallId, date);
  }

  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.createBooking(dto);
  }
  // GET /bookings/:hallId/customer/:phone
@Get(':hallId/customer/:phone')
async findCustomerByPhone(
  @Param('hallId', ParseIntPipe) hallId: number,
  @Param('phone') phone: string,
) {
  return this.bookingsService.findCustomerByPhone(hallId, phone);
}
@Patch(':hallId/:bookingId/time')
  async updateBookingTime(
    @Param('hallId', ParseIntPipe) hallId: number,
    @Param('bookingId', ParseIntPipe) bookingId: number,
    @Body() dto: UpdateBookingDto,
  ) {
    return this.bookingsService.updateBookingTime(hallId, bookingId, dto);
  }
}
