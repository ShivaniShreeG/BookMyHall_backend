import { Controller, Get, Param } from '@nestjs/common';
import { CalendarService } from './calendar.service';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  // 📅 Full calendar (bookings + peak hours + available)
  @Get(':hallId')
  async getCalendar(@Param('hallId') hallId: string) {
    return this.calendarService.getCalendar(Number(hallId));
  }

  // 📅 Booked dates only
  @Get(':hallId/booked')
  async getBooked(@Param('hallId') hallId: string) {
    return this.calendarService.getBookedOnly(Number(hallId));
  }
}
