import { Module } from '@nestjs/common';
import { PeakHoursService } from './peak-hours.service';
import { PeakHoursController } from './peak-hours.controller';

@Module({
  providers: [PeakHoursService],
  controllers: [PeakHoursController],
})
export class PeakHoursModule {}
