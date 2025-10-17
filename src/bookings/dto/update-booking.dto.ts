import { IsDateString, IsNotEmpty ,IsString ,IsOptional} from 'class-validator';

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

  @IsString()
  @IsOptional()
  tamil_date?: string;

  @IsString()
  @IsOptional()
  tamil_month?: string;
}
