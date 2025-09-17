import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ChargesService } from './charges.service';

@Controller('charges')
export class ChargesController {
  constructor(private readonly chargesService: ChargesService) {}

  // GET /charges/:hallId → all charges for a hall
  @Get(':hallId')
  findAllByHall(@Param('hallId', ParseIntPipe) hallId: number) {
    return this.chargesService.findAllByHall(hallId);
  }

  // GET /charges/:hallId/:bookingId → all charges for a booking
  @Get(':hallId/:bookingId')
  findAllByBooking(
    @Param('hallId', ParseIntPipe) hallId: number,
    @Param('bookingId', ParseIntPipe) bookingId: number,
  ) {
    return this.chargesService.findAllByBooking(hallId, bookingId);
  }
}
