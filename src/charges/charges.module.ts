import { Module } from '@nestjs/common';
import { ChargesService } from './charges.service';
import { ChargesController } from './charges.controller';

@Module({
  providers: [ChargesService],
  controllers: [ChargesController],
})
export class ChargesModule {}
