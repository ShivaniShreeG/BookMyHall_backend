import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class CreateMessageDto {
  @IsInt()
  hall_id: number;

  @IsString()
  @IsNotEmpty()
  message: string;
}
