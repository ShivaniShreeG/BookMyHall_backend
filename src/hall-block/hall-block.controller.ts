import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { HallBlockService } from './hall-block.service';

@Controller('hall-blocks')
export class HallBlockController {
  constructor(private readonly hallBlockService: HallBlockService) {}

  // GET /hall-blocks → all hall blocks
  @Get()
  findAll() {
    return this.hallBlockService.findAll();
  }

  // GET /hall-blocks/:hallId → block for a specific hall
  @Get(':hallId')
  findByHall(@Param('hallId', ParseIntPipe) hallId: number) {
    return this.hallBlockService.findByHall(hallId);
  }
}
