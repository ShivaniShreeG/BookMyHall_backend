import { Module } from '@nestjs/common';
import { CancelService } from './cancel.service';
import { CancelController } from './cancel.controller';

@Module({
  providers: [CancelService],
  controllers: [CancelController],
})
export class CancelModule {}
