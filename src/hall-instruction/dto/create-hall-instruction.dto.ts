import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CreateHallInstructionDto {
  @IsInt()
  hall_id: number;

  @IsString()
  @IsNotEmpty()
  instruction: string;
}
