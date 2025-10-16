import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateExpenseDto } from './dto/expense.dto';
import { UpdateExpenseDto } from './dto/expense.dto';

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
  async create(dto: CreateExpenseDto) {
    const expense = await prisma.expense.create({
      data: {
        hall_id: dto.hall_id,
        reason: dto.reason,
        amount: dto.amount,
      },
      select: {
        id: true,
        hall_id: true,
        reason: true,
        amount: true,
        created_at: true,
      },
    });
    return expense;
  }

  // 4️⃣ Update expense
  async update(expenseId: number, dto: UpdateExpenseDto) {
    // Check if exists
    const existing = await prisma.expense.findUnique({ where: { id: expenseId } });
    if (!existing) throw new NotFoundException(`Expense ID ${expenseId} not found`);

    const updated = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        reason: dto.reason ?? existing.reason,
        amount: dto.amount ?? existing.amount,
      },
      select: {
        id: true,
        hall_id: true,
        reason: true,
        amount: true,
        created_at: true,
      },
    });

    return updated;
  }

  // 5️⃣ Delete expense
  async remove(expenseId: number) {
    // Check if exists
    const existing = await prisma.expense.findUnique({ where: { id: expenseId } });
    if (!existing) throw new NotFoundException(`Expense ID ${expenseId} not found`);

    await prisma.expense.delete({ where: { id: expenseId } });
    return { message: `Expense ID ${expenseId} deleted successfully` };
  }
}
