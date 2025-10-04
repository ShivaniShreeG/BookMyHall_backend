import { IsOptional, IsString, IsInt } from 'class-validator';

export class UpdateHallInstructionDto {
  @IsInt()
  hall_id: number;

  @IsString()
  @IsOptional()
  instruction?: string;
}
