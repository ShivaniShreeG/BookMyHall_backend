import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateDrawingDto {
  @IsString()
  @IsOptional()
  reason?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;
}
