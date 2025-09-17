import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { BillingService } from './billing.service';

@Controller('billings')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // GET /billings/:hallId → all billings for a hall
  @Get(':hallId')
  findAllByHall(@Param('hallId', ParseIntPipe) hallId: number) {
    return this.billingService.findAllByHall(hallId);
  }

  // GET /billings/:hallId/:bookingId → all billings for a booking
  @Get(':hallId/:bookingId')
  findByBooking(
    @Param('hallId', ParseIntPipe) hallId: number,
    @Param('bookingId', ParseIntPipe) bookingId: number,
  ) {
    return this.billingService.findByBooking(hallId, bookingId);
  }

  // GET /billings/:hallId/user/:userId → all billings for a user
  @Get(':hallId/user/:userId')
  findByUser(
    @Param('hallId', ParseIntPipe) hallId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.billingService.findByUser(hallId, userId);
  }
}
