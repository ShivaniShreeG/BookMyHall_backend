import { IsArray, IsDateString, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePeakHourAllDto {
  @IsArray()
  @IsDateString({}, { each: true })
  dates: string[];

  @IsNumber()
  rent: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
