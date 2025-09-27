import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateDefaultValueDto {
  @IsOptional()
  @IsNumber()
  userId?: number; // allow updating user_id

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  reason?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;
}
