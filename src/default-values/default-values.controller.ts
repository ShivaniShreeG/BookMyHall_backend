import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { DefaultValuesService } from './default-values.service';

@Controller('default-values')
export class DefaultValuesController {
  constructor(private readonly defaultValuesService: DefaultValuesService) {}

  // GET /default-values/:hallId → all default values for a hall
  @Get(':hallId')
  findAllByHall(@Param('hallId', ParseIntPipe) hallId: number) {
    return this.defaultValuesService.findAllByHall(hallId);
  }

  // GET /default-values/:hallId/:userId → default values for a user in a hall
  @Get(':hallId/:userId')
  findByHallAndUser(
    @Param('hallId', ParseIntPipe) hallId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.defaultValuesService.findByHallAndUser(hallId, userId);
  }
}
