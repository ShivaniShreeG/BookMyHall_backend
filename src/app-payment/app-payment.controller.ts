import { Controller, Post, Get, Param, ParseIntPipe, Body } from '@nestjs/common';
import { AppPaymentService } from './app-payment.service';
import { AppPaymentStatus } from '@prisma/client';

@Controller('api/app-payment')
export class AppPaymentController {
  constructor(private readonly appPaymentService: AppPaymentService) {}

  // ✅ Create yearly payment
  @Post('create/:hallId')
  async createPayment(
    @Param('hallId', ParseIntPipe) hallId: number,
    @Body('transactionId') transactionId?: string,
  ) {
    return this.appPaymentService.createYearlyPayment(hallId, transactionId);
  }

  // ✅ Update payment status
  @Post('update-status/:paymentId')
  async updateStatus(
    @Param('paymentId', ParseIntPipe) paymentId: number,
    @Body() body: { status: AppPaymentStatus; transactionId?: string },
  ) {
    return this.appPaymentService.updatePaymentStatus(paymentId, body.status, body.transactionId);
  }

  // ✅ Get current/latest payment
  @Get('current/:hallId')
  async getCurrentPayment(@Param('hallId', ParseIntPipe) hallId: number) {
    return this.appPaymentService.getCurrentPayment(hallId);
  }

  // ✅ Get all payments
  @Get('history/:hallId')
  async getPaymentHistory(@Param('hallId', ParseIntPipe) hallId: number) {
    return this.appPaymentService.getPaymentHistory(hallId);
  }

  // ✅ Expire old ones manually
  @Post('expire')
  async expireOldPayments() {
    return this.appPaymentService.expireOldPayments();
  }
}
