import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ExpenseService } from './expense.service';

@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  // GET /expenses/:hallId → all expenses for a hall
  @Get(':hallId')
  findAllByHall(@Param('hallId', ParseIntPipe) hallId: number) {
    return this.expenseService.findAllByHall(hallId);
  }

  // GET /expenses/:hallId/:expenseId → specific expense
  @Get(':hallId/:expenseId')
  findOne(
    @Param('hallId', ParseIntPipe) hallId: number,
    @Param('expenseId', ParseIntPipe) expenseId: number,
  ) {
    return this.expenseService.findOne(hallId, expenseId);
  }
}
