import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateCancelDto {
  @IsInt()
  hall_id: number;

  @IsInt()
  booking_id: number;

  @IsInt()
  user_id: number;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsNumber()
  @Min(0)
  cancel_charge: number;
}
