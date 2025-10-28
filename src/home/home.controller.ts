import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
  constructor(private readonly HomeService: HomeService) {}

  // ✅ Count monthly peak hours for a hall
  @Get('peak-hour/month/:hall_id/:year/:month')
  async getMonthlyCount(
    @Param('hall_id', ParseIntPipe) hall_id: number,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    return this.HomeService.countMonthlyPeakHours(hall_id, year, month);
  }

  // ✅ Count yearly peak hours for a hall
  @Get('peak-hour/year/:hall_id/:year')
  async getYearlyCount(
    @Param('hall_id', ParseIntPipe) hall_id: number,
    @Param('year', ParseIntPipe) year: number,
  ) {
    return this.HomeService.countYearlyPeakHours(hall_id, year);
  }
  @Get('/peak-hour/breakdown/:hall_id/:year')
async getMonthlyBreakdown(
  @Param('hall_id', ParseIntPipe) hall_id: number,
  @Param('year', ParseIntPipe) year: number,
) {
  return this.HomeService.getMonthlyBreakdown(hall_id, year);
}
@Get('completed/:hall_id')
  async getCompletedEvents(@Param('hall_id', ParseIntPipe) hall_id: number) {
    return this.HomeService.countCompletedEventsCurrentYear(hall_id);
  }
@Get('upcoming/year/:hall_id')
async getUpcomingEventsForYear(@Param('hall_id', ParseIntPipe) hall_id: number) {
  return this.HomeService.getUpcomingEventsForYear(hall_id);
}

  @Get('upcoming/:hall_id')
async getUpcomingEvents(@Param('hall_id', ParseIntPipe) hall_id: number) {
  return this.HomeService.getUpcomingEvents(hall_id);
}
@Get('peak-hour/upcoming/:hall_id')
async getNextTwelveMonthsBreakdown(@Param('hall_id') hall_id: number) {
  return this.HomeService.getNextTwelveMonthsBreakdown(+hall_id);
}


}
