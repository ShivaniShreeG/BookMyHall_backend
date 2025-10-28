import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient, AppPaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_YEARLY_AMOUNT = 5000; // yearly base fee
const GST_RATE = 0.18; // 18%

@Injectable()
export class AppPaymentService {
  /**
   * ✅ Create or renew a yearly payment (with 18% GST)
   */
  async createYearlyPayment(hallId: number, transactionId?: string) {
  const hall = await prisma.hall.findUnique({
    where: { hall_id: hallId },
  });

  if (!hall) throw new NotFoundException(`Hall ID ${hallId} not found.`);

  // determine start date
  const periodStart = hall.dueDate ? new Date(hall.dueDate) : new Date();
  const periodEnd = new Date(periodStart);
  periodEnd.setFullYear(periodEnd.getFullYear() + 1);

  // check if already active/pending payment exists
  const existing = await prisma.appPayment.findFirst({
    where: {
      hall_id: hallId,
      status: { in: ['PENDING', 'COMPLETED'] },
      periodEnd: { gte: periodStart },
    },
  });

  if (existing) {
    throw new BadRequestException(
      'Hall already has an active or pending yearly payment.',
    );
  }

  // 💰 Compute GST and total
  const gstAmount = +(BASE_YEARLY_AMOUNT * GST_RATE).toFixed(2);
  const totalAmount = +(BASE_YEARLY_AMOUNT + gstAmount).toFixed(2);

  // 🏦 Create pending payment
  const payment = await prisma.appPayment.create({
    data: {
      hall_id: hallId,
      BaseAmount: BASE_YEARLY_AMOUNT,
      amount: totalAmount, // ✅ store total (incl. GST)
      transactionId: transactionId ?? null,
      periodStart,
      periodEnd,
      status: AppPaymentStatus.PENDING,
    },
  });

  // 🔁 Return with computed fields for frontend
  return {
    ...payment,
    gstAmount,
    totalAmount, // this is what frontend should pay
  };
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
async getCurrentPayment(hallId: number) {
  const payment = await prisma.appPayment.findFirst({
    where: { hall_id: hallId },
    orderBy: { createdAt: 'desc' },
  });

  if (!payment)
    throw new NotFoundException(`No payments found for hall ID ${hallId}`);

  const base = Number(payment.BaseAmount);
  const gstAmount = +(base * GST_RATE).toFixed(2);
  const totalAmount = +(base + gstAmount).toFixed(2);

  const now = new Date();

  // ✅ Can renew if:
  // - Payment is failed or pending
  // - OR the last completed period has expired
  const canRenew =
    payment.status === AppPaymentStatus.FAILED ||
    payment.status === AppPaymentStatus.PENDING ||
    payment.periodEnd < now;

  return {
    ...payment,
    gstAmount,
    totalAmount,
    canRenew, // 👈 new field for frontend
  };
}

//   async getCurrentPayment(hallId: number) {
//   const payment = await prisma.appPayment.findFirst({
//     where: { hall_id: hallId },
//     orderBy: { createdAt: 'desc' },
//   });

//   if (!payment)
//     throw new NotFoundException(`No payments found for hall ID ${hallId}`);

//   const base = Number(payment.BaseAmount);
//   const gstAmount = +(base * GST_RATE).toFixed(2);
//   const totalAmount = +(base + gstAmount).toFixed(2);

//   return { ...payment, gstAmount, totalAmount };
// }

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
   * ✅ Expire old payments (mark FAILED)
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
