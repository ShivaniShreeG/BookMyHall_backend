import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class ExpenseService {
  // 1️⃣ All expenses for a hall
  async findAllByHall(hallId: number) {
    const expenses = await prisma.expense.findMany({
      where: { hall_id: hallId },
      select: {
        id: true,
        hall_id: true,
        reason: true,
        amount: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    });

    if (!expenses.length)
      throw new NotFoundException(`No expenses found for hall ID ${hallId}`);
    return expenses;
  }

  // 2️⃣ Optional: single expense by ID
  async findOne(hallId: number, expenseId: number) {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      select: {
        id: true,
        hall_id: true,
        reason: true,
        amount: true,
        created_at: true,
      },
    });

    if (!expense)
      throw new NotFoundException(
        `Expense ID ${expenseId} not found for hall ID ${hallId}`,
      );
    return expense;
  }
}
