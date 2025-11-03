import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class HomeService {
  // ✅ Count total peak hours for a month
  async countMonthlyPeakHours(hall_id: number, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const count = await prisma.peak_hours.count({
      where: {
        hall_id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return {
      hall_id,
      year,
      month,
      count,
      message: `Total ${count} peak hour bookings in ${month}-${year}`,
    };
  }

  // ✅ Count total peak hours for a year
  async countYearlyPeakHours(hall_id: number, year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const count = await prisma.peak_hours.count({
      where: {
        hall_id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return {
      hall_id,
      year,
      count,
      message: `Total ${count} peak hour bookings in year ${year}`,
    };
  }

  async getMonthlyBreakdown(hall_id: number, year: number) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  const records = await prisma.peak_hours.findMany({
    where: {
      hall_id,
      date: { gte: startDate, lte: endDate },
    },
    select: { date: true },
  });

  const monthlyCount = Array(12).fill(0);

  records.forEach(r => {
    const month = new Date(r.date).getMonth(); // 0–11
    monthlyCount[month]++;
  });

  return {
    hall_id,
    year,
    monthlyCount: {
      JAN: monthlyCount[0],
      FEB: monthlyCount[1],
      MAR: monthlyCount[2],
      APR: monthlyCount[3],
      MAY: monthlyCount[4],
      JUN: monthlyCount[5],
      JUL: monthlyCount[6],
      AUG: monthlyCount[7],
      SEP: monthlyCount[8],
      OCT: monthlyCount[9],
      NOV: monthlyCount[10],
      DEC: monthlyCount[11],
    },
  };
}

async countCompletedEventsCurrentYear(hall_id: number) {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

  // Start of today (00:00:00)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const count = await prisma.bookings.count({
    where: {
      hall_id,
      status: { in: ['booked', 'billed'] },
      function_date: {
        gte: startOfYear,
        lt: startOfToday, // strictly before today
        lte: endOfYear,
      },
    },
  });

  return { year: now.getFullYear(), completed_events: count };
}


async getUpcomingEvents(hall_id: number) {
  const now = new Date();
  const fourMonthsLater = new Date();
  fourMonthsLater.setMonth(now.getMonth() + 4);

  // Fetch bookings with status 'booked' or 'billed' between now and next 4 months
  const upcoming = await prisma.bookings.findMany({
    where: {
      hall_id,
      status: { in: ['booked', 'billed'] },
      function_date: {
        gte: now,
        lte: fourMonthsLater,
      },
    },
    select: { function_date: true },
  });

  // Step 1: Prepare default 4-month labels (current + next 3)
  const months: string[] = [];
  for (let i = 0; i < 4; i++) {
    const m = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const label = m.toLocaleString('default', { month: 'short', year: 'numeric' }); // e.g., "Nov 2025"
    months.push(label);
  }

  // Step 2: Group fetched bookings by month
  const counts: Record<string, number> = {};
  upcoming.forEach((b) => {
    const d = new Date(b.function_date);
    const label = d.toLocaleString('default', { month: 'short', year: 'numeric' });
    counts[label] = (counts[label] || 0) + 1;
  });

  // Step 3: Merge with default months (fill 0 if no bookings)
  const monthData: Record<string, number> = {};
  months.forEach((m) => {
    monthData[m] = counts[m] || 0;
  });

  // Step 4: Total count
  const total = Object.values(monthData).reduce((sum, c) => sum + c, 0);

  // Step 5: Return in correct order
  return { total, months: monthData };
}
async getNextTwelveMonthsBreakdown(hall_id: number) {
  const now = new Date();
  const monthsData: Record<string, number> = {};

  // Check if today is the last day of the current month
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const skipCurrentMonth = now.getDate() === lastDayOfMonth.getDate();

  for (let i = 0; i < 12; i++) {
    const monthOffset = skipCurrentMonth ? i + 1 : i;
    const monthDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    // For current month (if not skipped), start from 'now'; else from 1st
    const startDate =
      i === 0 && !skipCurrentMonth
        ? now
        : new Date(year, month, 1);

    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    const count = await prisma.peak_hours.count({
      where: {
        hall_id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const label = monthDate.toLocaleString('default', {
      month: 'short',
      year: 'numeric',
    });

    monthsData[label] = count;
  }

  const total = Object.values(monthsData).reduce((a, b) => a + b, 0);

  return { hall_id, total, months: monthsData };
}

// async getNextTwelveMonthsBreakdown(hall_id: number) {
//   const now = new Date();
//   const monthsData: Record<string, number> = {};

//   for (let i = 0; i < 12; i++) {
//     const monthDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
//     const year = monthDate.getFullYear();
//     const month = monthDate.getMonth();

//     const startDate = new Date(year, month, 1);
//     const endDate = new Date(year, month + 1, 0, 23, 59, 59);

//     const count = await prisma.peak_hours.count({
//       where: {
//         hall_id,
//         date: {
//           gte: startDate,
//           lte: endDate,
//         },
//       },
//     });

//     const label = monthDate.toLocaleString('default', { month: 'short', year: 'numeric' });
//     monthsData[label] = count;
//   }

//   const total = Object.values(monthsData).reduce((a, b) => a + b, 0);
//   return { hall_id, total, months: monthsData };
// }
async getUpcomingEventsForYear(hall_id: number) {
  const now = new Date();
  const monthsData: Record<string, number> = {};

  // Loop through the next 12 months (always including current month)
  for (let i = 0; i < 12; i++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    // For the *first month*, start from today
    const startDate =
      i === 0
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
        : new Date(year, month, 1);

    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    const count = await prisma.bookings.count({
      where: {
        hall_id,
        status: { in: ['booked', 'billed'] },
        function_date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const label = monthDate.toLocaleString('default', {
      month: 'short',
      year: 'numeric',
    });

    monthsData[label] = count;
  }

  const total = Object.values(monthsData).reduce((a, b) => a + b, 0);

  return { total, months: monthsData };
}


// async getUpcomingEventsForYear(hall_id: number) {
//   const now = new Date();
//   const monthsData: Record<string, number> = {};

//   // Loop through the next 12 months (including current)
//   for (let i = 0; i < 12; i++) {
//     const monthDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
//     const year = monthDate.getFullYear();
//     const month = monthDate.getMonth();

//     const startDate = new Date(year, month, 1);
//     const endDate = new Date(year, month + 1, 0, 23, 59, 59);

//     // Count events for each month
//     const count = await prisma.bookings.count({
//       where: {
//         hall_id,
//         status: { in: ['booked', 'billed'] },
//         function_date: {
//           gte: startDate,
//           lte: endDate,
//         },
//       },
//     });

//     const label = monthDate.toLocaleString('default', { month: 'short', year: 'numeric' });
//     monthsData[label] = count;
//   }

//   // Total of all 12 months
//   const total = Object.values(monthsData).reduce((a, b) => a + b, 0);

//   return { total, months: monthsData };
// }

}
