// create-peak-hour.dto.ts
import { IsNotEmpty, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreatePeakHourDto {
  @IsNumber()
  hall_id: number;

  @IsNumber()
  user_id: number;

  @IsDateString()
  date: string;

  @IsOptional()
  reason?: string;

  @IsNumber()
  rent: number;
}
