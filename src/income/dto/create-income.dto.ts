import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateIncomeDto {
  @IsInt()
  hall_id: number;

  @IsInt()
  user_id: number;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsNumber()
  amount: number;
}
