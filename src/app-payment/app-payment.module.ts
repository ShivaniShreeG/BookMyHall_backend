import { Module } from '@nestjs/common';
import { AppPaymentService } from './app-payment.service';
import { AppPaymentController } from './app-payment.controller';

@Module({
  providers: [AppPaymentService],
  controllers: [AppPaymentController],
})
export class AppPaymentModule {}
