import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateDefaultValueDto {
  @IsNumber()
  hallId: number; // optional if you pass from URL

  @IsNumber()
  userId: number;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsNumber()
  @Min(0)
  amount: number;
}
