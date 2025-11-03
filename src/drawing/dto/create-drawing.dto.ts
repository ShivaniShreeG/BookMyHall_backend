import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateDrawingDto {
  @IsInt()
  hall_id: number;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsInt()
  user_id: number;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsNumber()
  amount: number;
}
