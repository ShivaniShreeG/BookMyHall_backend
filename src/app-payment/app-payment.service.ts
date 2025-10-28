import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient, AppPaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_YEARLY_AMOUNT = 5000; // yearly base fee

@Injectable()
export class AppPaymentService {
  // ✅ Create a yearly payment for a hall
  async createYearlyPayment(hallId: number, transactionId?: string) {
    const hall = await prisma.hall.findUnique({
      where: { hall_id: hallId },
    });

    if (!hall) throw new NotFoundException(`Hall ID ${hallId} not found.`);

    // Check for any active or pending yearly payments
    const activePayment = await prisma.appPayment.findFirst({
      where: {
        hall_id: hallId,
        status: { in: ['PENDING', 'COMPLETED'] },
        periodEnd: { gte: new Date() },
      },
    });

    if (activePayment) {
      throw new BadRequestException('Hall already has an active or pending yearly payment.');
    }

    // Calculate start and end dates
    const periodStart = new Date();
    const periodEnd = new Date(periodStart);
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);

    // Create payment record
    const payment = await prisma.appPayment.create({
      data: {
        hall_id: hallId,
        BaseAmount: BASE_YEARLY_AMOUNT,
        amount: BASE_YEARLY_AMOUNT,
        transactionId: transactionId || null,
        periodStart,
        periodEnd,
        status: AppPaymentStatus.PENDING,
      },
    });

    return payment;
  }

  // ✅ Update payment status (e.g., after Razorpay/Stripe success)
  async updatePaymentStatus(paymentId: number, status: AppPaymentStatus, transactionId?: string) {
    const payment = await prisma.appPayment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException(`Payment ID ${paymentId} not found.`);

    const updated = await prisma.appPayment.update({
      where: { id: paymentId },
      data: {
        status,
        transactionId: transactionId || payment.transactionId,
      },
    });

    // If payment is completed, update hall's due date
    if (status === AppPaymentStatus.COMPLETED) {
      await prisma.hall.update({
        where: { hall_id: payment.hall_id },
        data: { dueDate: payment.periodEnd },
      });
    }

    return updated;
  }

  // ✅ Get active or latest payment for a hall
  async getCurrentPayment(hallId: number) {
    const payment = await prisma.appPayment.findFirst({
      where: { hall_id: hallId },
      orderBy: { paidAt: 'desc' },
    });

    if (!payment) throw new NotFoundException(`No payments found for hall ID ${hallId}`);
    return payment;
  }

  // ✅ Get full payment history for a hall
  async getPaymentHistory(hallId: number) {
    const payments = await prisma.appPayment.findMany({
      where: { hall_id: hallId },
      orderBy: { paidAt: 'desc' },
    });

    if (!payments.length) throw new NotFoundException(`No payments found for hall ID ${hallId}`);
    return payments;
  }

  // ✅ Auto-expire old payments
  async expireOldPayments() {
    const now = new Date();
    const result = await prisma.appPayment.updateMany({
      where: {
        status: AppPaymentStatus.COMPLETED,
        periodEnd: { lt: now },
      },
      data: { status: AppPaymentStatus.FAILED },
    });

    return { expiredCount: result.count };
  }
}
