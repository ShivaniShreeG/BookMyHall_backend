// src/hall/dto/block-hall.dto.ts
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class BlockHallDto {
  @IsBoolean()
  block: boolean;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Reason should be at least 3 characters long' })
  reason?: string;
}
