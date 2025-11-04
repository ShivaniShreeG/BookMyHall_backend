import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class CreateSubmitTicketDto {
  @IsInt()
  hall_id: number;

  @IsInt()
  user_id: number;

  @IsString()
  @IsNotEmpty()
  issue: string;
}
