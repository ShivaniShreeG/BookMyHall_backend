import { Controller, Get, Post, Body, Patch, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/expense.dto';
import { UpdateExpenseDto } from './dto/expense.dto';

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
  // POST /expenses → create new expense
  @Post()
  create(@Body() dto: CreateExpenseDto) {
    return this.expenseService.create(dto);
  }

  // PATCH /expenses/:expenseId → update an expense
  @Patch(':expenseId')
  update(
    @Param('expenseId', ParseIntPipe) expenseId: number,
    @Body() dto: UpdateExpenseDto
  ) {
    return this.expenseService.update(expenseId, dto);
  }

  // DELETE /expenses/:expenseId → delete an expense
  @Delete(':expenseId')
  remove(@Param('expenseId', ParseIntPipe) expenseId: number) {
    return this.expenseService.remove(expenseId);
  }
}
