import { Module } from '@nestjs/common';
import { HallModule } from './hall/hall.module';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { PeakHoursModule } from './peak-hours/peak-hours.module';
import { BookingsModule } from './bookings/bookings.module';
import { CancelModule } from './cancel/cancel.module';
import { ChargesModule } from './charges/charges.module';
import { HallBlockModule } from './hall-block/hall-block.module';
import { DefaultValuesModule } from './default-values/default-values.module';
import { BillingModule } from './billing/billing.module';
import { ExpenseModule } from './expense/expense.module';
import { ProfileModule } from './profile/profile.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DashboardModule } from './dashboard/dashboard.module';
import { CalendarModule } from './calendar/calendar.module';
import { HallInstructionModule } from './hall-instruction/hall-instructions.module';
import { HistoryModule } from './history/history.module';
import { IncomeModule } from './income/income.module';
import { FacilitatorModule } from './facilitator/facility.module';
import { HomeModule } from './home/home.module';

@Module({
  imports: [
    HallModule,
    UserModule,
    AdminModule,
    PeakHoursModule,
    BookingsModule,
    CancelModule,
    ChargesModule,
    HallBlockModule,
    DefaultValuesModule,
    BillingModule,
    ExpenseModule,
    ProfileModule,
    DashboardModule,
    CalendarModule,
    HallInstructionModule,
    HistoryModule,
    IncomeModule,
    FacilitatorModule,
    HomeModule
  ],
  controllers:[AppController],
  providers:[AppService],
})
export class AppModule {}
