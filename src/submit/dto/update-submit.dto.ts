import { IsOptional, IsString } from 'class-validator';

export class UpdateSubmitTicketDto {
  @IsOptional()
  @IsString()
  issue?: string;
}
