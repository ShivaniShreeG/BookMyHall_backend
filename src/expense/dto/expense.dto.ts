import { IsNotEmpty, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class CreateExpenseDto {
  @IsNotEmpty()
  reason: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNumber()
  hall_id: number;
}

export class UpdateExpenseDto {
  @IsOptional()
  reason?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;
}
