import { IsNumber, IsOptional, IsString, IsNotEmpty} from 'class-validator';

export class UpdateDrawingDto {
  @IsString()
  @IsOptional()
  reason?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsNotEmpty()
  type: string;
}
