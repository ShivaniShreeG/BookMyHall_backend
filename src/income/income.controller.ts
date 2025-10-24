import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { IncomeService } from './income.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

@Controller('income')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  create(@Body() dto: CreateIncomeDto) {
    return this.incomeService.create(dto);
  }

  @Get('hall/:hallId')
  findAllByHall(@Param('hallId') hallId: number) {
    return this.incomeService.findAllByHall(Number(hallId));
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.incomeService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateIncomeDto) {
    return this.incomeService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.incomeService.remove(Number(id));
  }
}
