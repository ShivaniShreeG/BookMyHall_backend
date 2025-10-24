import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateIncomeDto {
  @IsString()
  @IsOptional()
  reason?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;
}
