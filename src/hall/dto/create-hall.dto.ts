// src/hall/dto/create-hall.dto.ts
import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';

export class CreateHallDto {
  @IsOptional()
  @IsInt()
  hall_id?: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  logo?: string; // Base64 string
}
