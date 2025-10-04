import { IsDateString, IsNotEmpty } from 'class-validator';

export class UpdateBookingDto {
  @IsNotEmpty()
  @IsDateString()
  function_date: string;

  @IsNotEmpty()
  @IsDateString()
  alloted_datetime_from: string;

  @IsNotEmpty()
  @IsDateString()
  alloted_datetime_to: string;
}
