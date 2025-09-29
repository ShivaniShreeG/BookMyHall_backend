// src/bookings/dto/add-charges.dto.ts
import { IsInt, IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

class ChargeItemDto {
  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsNumber()
  amount: number;
}

export class AddChargesDto {
  @IsInt()
  userId: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ChargeItemDto)
  charges: ChargeItemDto[];
}
