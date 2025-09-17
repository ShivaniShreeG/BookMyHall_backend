import { Module } from '@nestjs/common';
import { HallBlockService } from './hall-block.service';
import { HallBlockController } from './hall-block.controller';

@Module({
  providers: [HallBlockService],
  controllers: [HallBlockController],
})
export class HallBlockModule {}
