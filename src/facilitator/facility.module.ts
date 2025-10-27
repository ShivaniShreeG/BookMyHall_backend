import { Module } from '@nestjs/common';
import { FacilitatorService } from './facility.service';
import { FacilitatorController } from './facility.controller';

@Module({
  controllers: [FacilitatorController],
  providers: [FacilitatorService],
})
export class FacilitatorModule {}
