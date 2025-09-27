import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { DefaultValuesService } from './default-values.service';
import { CreateDefaultValueDto } from './dto/create-default-value.dto';
import { UpdateDefaultValueDto } from './dto/update-default-value.dto';

@Controller('default-values')
export class DefaultValuesController {
  constructor(private readonly defaultValuesService: DefaultValuesService) {}

  // GET /default-values/:hallId → all default values for a hall
  @Get(':hallId')
  findAllByHall(@Param('hallId', ParseIntPipe) hallId: number) {
    return this.defaultValuesService.findAllByHall(hallId);
  }
  @Post(':hallId')
  createDefault(
    @Param('hallId', ParseIntPipe) hallId: number,
    @Body() createDefaultValueDto: CreateDefaultValueDto,
  ) {
    return this.defaultValuesService.createDefault(hallId, createDefaultValueDto);
  }
   @Put(':defaultId')
  updateDefault(
    @Param('defaultId', ParseIntPipe) defaultId: number,
    @Body() updateDefaultValueDto: UpdateDefaultValueDto,
  ) {
    return this.defaultValuesService.updateDefault(defaultId, updateDefaultValueDto);
  }

  @Delete(':defaultId')
  deleteDefault(@Param('defaultId', ParseIntPipe) defaultId: number) {
    return this.defaultValuesService.deleteDefault(defaultId);
  }
}
