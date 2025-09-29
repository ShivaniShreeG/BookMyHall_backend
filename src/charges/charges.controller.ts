import { Controller, Get, Param, ParseIntPipe ,Body ,Post} from '@nestjs/common';
import { ChargesService } from './charges.service';
import { AddChargesDto } from './dto/add-charges.dto';

@Controller('charges')
export class ChargesController {
  constructor(private readonly chargesService: ChargesService) {}

  // GET /charges/:hallId → all charges for a hall
  @Get(':hallId')
  findAllByHall(@Param('hallId', ParseIntPipe) hallId: number) {
    return this.chargesService.findAllByHall(hallId);
  }

  // GET /charges/:hallId/:bookingId → all charges for a booking
  @Get(':hallId/:bookingId')
  findAllByBooking(
    @Param('hallId', ParseIntPipe) hallId: number,
    @Param('bookingId', ParseIntPipe) bookingId: number,
  ) {
    return this.chargesService.findAllByBooking(hallId, bookingId);
  }
  
  @Post(':hallId/:bookingId')
  async addCharges(
    @Param('hallId', ParseIntPipe) hallId: number,
    @Param('bookingId', ParseIntPipe) bookingId: number,
    @Body() addChargesDto: AddChargesDto,
  ) {
    const result = await this.chargesService.addCharges(hallId, bookingId, addChargesDto);
    return {
      message: 'Charges added successfully',
      data: result,
    };
  }
}
