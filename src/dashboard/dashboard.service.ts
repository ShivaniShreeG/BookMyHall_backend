import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class DashboardService {

  async getCounts() {
  const totalHalls = await prisma.hall.count({
    where: { hall_id: { gt: 0 } },
  });

  const totalUsers = await prisma.user.count({
    where: {
      hall_id: { gt: 0 },
      is_active: true, // Only count active users
    },
  });

  const totalBookings = await prisma.bookings.count({
    where: { hall_id: { gt: 0 } },
  });

  if (totalHalls === 0 && totalUsers === 0 && totalBookings === 0) {
    throw new NotFoundException('No data found for dashboard counts');
  }

  return {
    totalHalls,
    totalUsers,
    totalBookings,
  };
}

//   async getHallStats(hallId: number) {
//   // Ensure hall exists
//   const hall = await prisma.hall.findUnique({ where: { hall_id: hallId } });
//   if (!hall) throw new NotFoundException(`Hall with ID ${hallId} not found`);

//   // Count total bookings
//   const totalBookings = await prisma.bookings.count({ where: { hall_id: hallId } });

//   // Count cancelled bookings
//   const totalCancelled = await prisma.cancel.count({ where: { hall_id: hallId } });

//   // Total revenue = sum of all billing.total for the hall
//   const revenueAgg = await prisma.billing.aggregate({
//     where: { hall_id: hallId },
//     _sum: { total: true },
//   });
//   const totalRevenue = revenueAgg._sum.total || 0;

//   // Total expenses
//   const expensesAgg = await prisma.expense.aggregate({
//     where: { hall_id: hallId },
//     _sum: { amount: true },
//   });
//   const totalExpenses = expensesAgg._sum.amount || 0;

//   // Total users
//   const totalUsers = await prisma.user.count({ where: { hall_id: hallId } });

//   return {
//     hallId,
//     hallName: hall.name,
//     totalBookings,
//     totalCancelled,
//     totalRevenue,
//     totalExpenses,
//     totalUsers,
//   };
// }
async getHallStats(hallId: number) {
  // Ensure hall exists
  const hall = await prisma.hall.findUnique({ where: { hall_id: hallId } });
  if (!hall) throw new NotFoundException(`Hall with ID ${hallId} not found`);

  // Count total bookings
  const totalBookings = await prisma.bookings.count({ where: { hall_id: hallId } });

  // Count cancelled bookings
  const totalCancelled = await prisma.cancel.count({ where: { hall_id: hallId } });

  // Total revenue = sum of billing.total + sum of bookings.advance for the hall
  const revenueAgg = await prisma.billing.aggregate({
    where: { hall_id: hallId },
    _sum: { total: true },
  });

  const advanceAgg = await prisma.bookings.aggregate({
    where: { hall_id: hallId },
    _sum: { advance: true },
  });

  const totalRevenue = (revenueAgg._sum.total || 0) + (advanceAgg._sum.advance || 0);

  // Total refunds from cancelled bookings
  const refundAgg = await prisma.cancel.aggregate({
    where: { hall_id: hallId },
    _sum: { refund: true },
  });
  const totalRefunds = refundAgg._sum.refund || 0;

  // Total expenses
  const expensesAgg = await prisma.expense.aggregate({
    where: { hall_id: hallId },
    _sum: { amount: true },
  });
  const totalExpenses = (expensesAgg._sum.amount || 0);

  // Total users
  const totalUsers = await prisma.user.count({ where: { hall_id: hallId } });

  return {
    hallId,
    hallName: hall.name,
    totalBookings,
    totalCancelled,
    totalRevenue,
    totalExpenses,
    totalUsers,
    totalRefunds,
    netRevenue: totalRevenue - totalRefunds,
  };
}


}
