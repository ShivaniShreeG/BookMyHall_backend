import { Module } from '@nestjs/common';
import { HallInstructionsController } from './hall-instructions.controller';
import { HallInstructionsService } from './hall-instructions.service';

@Module({
  controllers: [HallInstructionsController],
  providers: [HallInstructionsService],
})
export class HallInstructionModule {}
