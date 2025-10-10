import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { HistoryService } from './history.service';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  // GET /history/:hallId
  @Get(':hallId')
  async getBookedHistory(@Param('hallId', ParseIntPipe) hallId: number) {
    return this.historyService.getBookedHistory(hallId);
  }
   @Get('/cancel/:hallId')
  async getCancelledHistory(@Param('hallId', ParseIntPipe) hallId: number) {
    return this.historyService.getCancelledHistory(hallId);
  }
}
