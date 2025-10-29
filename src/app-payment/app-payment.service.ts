import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient, AppPaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_YEARLY_AMOUNT = 1;
const GST_RATE = 0.18;

@Injectable()
export class AppPaymentService {
  /**
   * ✅ Create or renew yearly payment
   * Allowed 3 days before due date and any time after.
   */
 async createYearlyPayment(hallId: number, transactionId?: string) {
  const hall = await prisma.hall.findUnique({ where: { hall_id: hallId } });
  if (!hall) throw new NotFoundException(`Hall ID ${hallId} not found.`);

  const dueDate = hall.dueDate ? new Date(hall.dueDate) : null;
  const now = new Date();

  let periodStart: Date;
  let periodEnd: Date;

  // 🔍 Check duplicate active or future payments
  const duplicate = await prisma.appPayment.findFirst({
    where: {
      hall_id: hallId,
      status: { in: [AppPaymentStatus.PENDING, AppPaymentStatus.COMPLETED] },
      OR: [
        { periodStart: { gte: now } },
        { periodEnd: { gte: now } },
      ],
    },
  });

  if (duplicate) {
    throw new BadRequestException(
      `Duplicate payment found for ${duplicate.periodStart.getFullYear()}–${duplicate.periodEnd.getFullYear()}.`,
    );
  }

  // 🧾 First-time payment
  if (!dueDate) {
    periodStart = new Date();
    periodEnd = new Date(periodStart);
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    // 🧾 Renewal case → check dueDate from hall
    const oneMonthBeforeDue = new Date(dueDate);
    oneMonthBeforeDue.setDate(oneMonthBeforeDue.getDate() - 30);

    if (now < oneMonthBeforeDue) {
      throw new BadRequestException(
        `Renewal not allowed yet. You can renew from ${oneMonthBeforeDue.toDateString()} onwards (30 days before due date).`,
      );
    }

    // ✅ Set new payment period
    periodStart = new Date(dueDate);
    periodEnd = new Date(periodStart);
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  }

  // 💰 Calculate amount + GST
  const gstAmount = +(BASE_YEARLY_AMOUNT * GST_RATE).toFixed(2);
  const totalAmount = +(BASE_YEARLY_AMOUNT + gstAmount).toFixed(2);

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
   * Allowed if within 3 days before due date or after it.
   */
  async getCurrentPayment(hallId: number) {
  const hall = await prisma.hall.findUnique({ where: { hall_id: hallId } });
  if (!hall) throw new NotFoundException(`Hall ID ${hallId} not found.`);

  const dueDate = hall.dueDate ? new Date(hall.dueDate) : null;
  const now = new Date();

  // 🔍 Active PENDING/FAILED payment first
  const payment = await prisma.appPayment.findFirst({
    where: {
      hall_id: hallId,
      status: { in: [AppPaymentStatus.PENDING, AppPaymentStatus.FAILED] },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (payment) {
    const base = Number(payment.BaseAmount);
    const gstAmount = +(base * GST_RATE).toFixed(2);
    const totalAmount = +(base + gstAmount).toFixed(2);

    return {
      ...payment,
      gstAmount,
      totalAmount,
      canRenew: true,
    };
  }

  // 🧾 No pending payment — calculate next eligibility
  if (!dueDate) {
    // First-time payment (no due date yet)
    const base = BASE_YEARLY_AMOUNT;
    const gstAmount = +(base * GST_RATE).toFixed(2);
    const totalAmount = +(base + gstAmount).toFixed(2);

    const start = new Date();
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);

    return {
      id: null,
      status: 'None',
      BaseAmount: base,
      gstAmount,
      totalAmount,
      periodStart: start,
      periodEnd: end,
      canRenew: true,
    };
  }

  // 🧾 Renewal window check based on hall due date
  const oneMonthBeforeDue = new Date(dueDate);
  oneMonthBeforeDue.setDate(oneMonthBeforeDue.getDate() - 30);
  const canRenew = now >= oneMonthBeforeDue; // ✅ within 30 days or after due date

  // Prepare next payment period
  const nextStart = new Date(dueDate);
  const nextEnd = new Date(nextStart);
  nextEnd.setFullYear(nextEnd.getFullYear() + 1);

  const base = BASE_YEARLY_AMOUNT;
  const gstAmount = +(base * GST_RATE).toFixed(2);
  const totalAmount = +(base + gstAmount).toFixed(2);

  return {
    id: null,
    status: 'None',
    BaseAmount: base,
    gstAmount,
    totalAmount,
    periodStart: nextStart,
    periodEnd: nextEnd,
    canRenew,
  };
}

  /**
   * ✅ Get payment history
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
