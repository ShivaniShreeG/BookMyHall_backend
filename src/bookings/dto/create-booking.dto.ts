import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, IsArray, ArrayNotEmpty, IsEmail } from 'class-validator';

export class CreateBookingDto {
  @IsNumber()
  hall_id: number;

  @IsNumber()
  user_id: number;

  @IsDateString()
  function_date: string;

  @IsDateString()
  alloted_datetime_from: string;

  @IsDateString()
  alloted_datetime_to: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsArray()
  @IsOptional()
  @ArrayNotEmpty()
  @IsString({ each: true })
  alternate_phone?: string[];

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsNumber()
  rent: number;

  @IsNumber()
  advance: number;

  @IsNumber()
  balance: number;

  @IsString()
  @IsNotEmpty()
  event_type: string; // <-- added event_type

  @IsString()
  @IsOptional()
  tamil_date?: string;

  @IsString()
  @IsOptional()
  tamil_month?: string;
}
