import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('counts')
  async getCounts() {
    return this.dashboardService.getCounts();
  }
  @Get(':id/stats')
  async getHallStats(@Param('id', ParseIntPipe) hallId: number) {
    return this.dashboardService.getHallStats(hallId);
  }
}
