import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient, AppPaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_YEARLY_AMOUNT = 5000;
const GST_RATE = 0.18;

@Injectable()
export class AppPaymentService {
  /**
   * ✅ Create or renew yearly payment
   * Allows only next year's payment based on the latest completed period.
   */
 async createYearlyPayment(hallId: number, transactionId?: string) {
  const hall = await prisma.hall.findUnique({ where: { hall_id: hallId } });
  if (!hall) throw new NotFoundException(`Hall ID ${hallId} not found.`);

  // 🔍 Find latest completed payment
  const lastCompleted = await prisma.appPayment.findFirst({
    where: { hall_id: hallId, status: AppPaymentStatus.COMPLETED },
    orderBy: { periodEnd: 'desc' },
  });

  let periodStart: Date;
  let periodEnd: Date;

  if (lastCompleted) {
    // ✅ Always allow paying for next year
    periodStart = new Date(lastCompleted.periodEnd);
    periodEnd = new Date(periodStart);
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);

    // 🧠 Stop duplicates (no double payment for same year)
    const existingNext = await prisma.appPayment.findFirst({
      where: {
        hall_id: hallId,
        periodStart,
        periodEnd,
        status: { in: [AppPaymentStatus.PENDING, AppPaymentStatus.COMPLETED] },
      },
    });

    if (existingNext) {
      throw new BadRequestException(
        `Payment for ${periodStart.getFullYear()}–${periodEnd.getFullYear()} already exists.`,
      );
    }
  } else {
    // 🆕 First-time payment
    periodStart = hall.dueDate ? new Date(hall.dueDate) : new Date();
    periodEnd = new Date(periodStart);
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  }

  // 💰 Calculate base + GST
  const gstAmount = +(BASE_YEARLY_AMOUNT * GST_RATE).toFixed(2);
  const totalAmount = +(BASE_YEARLY_AMOUNT + gstAmount).toFixed(2);

  // 🏦 Create new pending payment
  const payment = await prisma.appPayment.create({
    data: {
      hall_id: hallId,
      BaseAmount: BASE_YEARLY_AMOUNT,
      amount: totalAmount,
      transactionId: transactionId ?? null,
      periodStart,
      periodEnd,
      status: AppPaymentStatus.PENDING,
    },
  });

  return { ...payment, gstAmount, totalAmount };
}


  /**
   * ✅ Update payment status
   */
  async updatePaymentStatus(
    paymentId: number,
    status: AppPaymentStatus,
    transactionId?: string,
  ) {
    const payment = await prisma.appPayment.findUnique({
      where: { id: paymentId },
    });
    if (!payment)
      throw new NotFoundException(`Payment ID ${paymentId} not found.`);

    const updateData: any = {
      status,
      transactionId: transactionId ?? payment.transactionId,
    };

    if (status === AppPaymentStatus.COMPLETED) {
      updateData.paidAt = new Date();

      const [updatedPayment] = await prisma.$transaction([
        prisma.appPayment.update({
          where: { id: paymentId },
          data: updateData,
        }),
        prisma.hall.update({
          where: { hall_id: payment.hall_id },
          data: { dueDate: payment.periodEnd },
        }),
      ]);

      return updatedPayment;
    }

    return prisma.appPayment.update({
      where: { id: paymentId },
      data: updateData,
    });
  }

  /**
   * ✅ Get current payment and renewal eligibility
   */
async getCurrentPayment(hallId: number) {
  // 🔍 Find the latest PENDING or FAILED payment only
  const payment = await prisma.appPayment.findFirst({
    where: {
      hall_id: hallId,
      status: { in: [AppPaymentStatus.PENDING, AppPaymentStatus.FAILED] },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!payment) {
    // 🧠 No pending/failed payment exists, return renewal eligibility info
    const lastCompleted = await prisma.appPayment.findFirst({
      where: { hall_id: hallId, status: AppPaymentStatus.COMPLETED },
      orderBy: { periodEnd: 'desc' },
    });

    if (!lastCompleted) {
      throw new NotFoundException(`No payments found for hall ID ${hallId}`);
    }

    const base = BASE_YEARLY_AMOUNT;
    const gstAmount = +(base * GST_RATE).toFixed(2);
    const totalAmount = +(base + gstAmount).toFixed(2);
    const now = new Date();

    // ✅ Allow renewal for next year only
    const nextPeriodStart = new Date(lastCompleted.periodEnd);
    const nextPeriodEnd = new Date(nextPeriodStart);
    nextPeriodEnd.setFullYear(nextPeriodEnd.getFullYear() + 1);

    const canRenew = true; // ✅ always allow next year's payment

    return {
      id: null,
      status: 'NONE',
      BaseAmount: base,
      gstAmount,
      totalAmount,
      periodStart: nextPeriodStart,
      periodEnd: nextPeriodEnd,
      canRenew,
    };
  }

  // ✅ When found pending/failed payment
  const base = Number(payment.BaseAmount);
  const gstAmount = +(base * GST_RATE).toFixed(2);
  const totalAmount = +(base + gstAmount).toFixed(2);

  return {
    ...payment,
    gstAmount,
    totalAmount,
    canRenew: true, // can retry
  };
}




  /**
   * ✅ Get all past payments
   */
  async getPaymentHistory(hallId: number) {
    const payments = await prisma.appPayment.findMany({
      where: { hall_id: hallId },
      orderBy: { periodStart: 'desc' },
    });

    if (!payments.length)
      throw new NotFoundException(`No payments found for hall ID ${hallId}`);

    return payments.map((p) => {
      const base = Number(p.BaseAmount);
      const gstAmount = +(base * GST_RATE).toFixed(2);
      const totalAmount = +(base + gstAmount).toFixed(2);
      return { ...p, gstAmount, totalAmount };
    });
  }

  /**
   * ✅ Auto-expire old completed payments
   */
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
