import { IsNotEmpty, IsNumber, IsString, IsPositive } from 'class-validator';

export class AddBalancePaymentDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
