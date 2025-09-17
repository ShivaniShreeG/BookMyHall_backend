import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CancelService } from './cancel.service';

@Controller('cancels')
export class CancelController {
  constructor(private readonly cancelService: CancelService) {}

  // GET /cancels/:hallId → all cancels for a hall
  @Get(':hallId')
  findAllByHall(@Param('hallId', ParseIntPipe) hallId: number) {
    return this.cancelService.findAllByHall(hallId);
  }

  // GET /cancels/:hallId/:bookingId → specific cancel
  @Get(':hallId/:bookingId')
  findOneByBooking(
    @Param('hallId', ParseIntPipe) hallId: number,
    @Param('bookingId', ParseIntPipe) bookingId: number,
  ) {
    return this.cancelService.findOneByBooking(hallId, bookingId);
  }
}
