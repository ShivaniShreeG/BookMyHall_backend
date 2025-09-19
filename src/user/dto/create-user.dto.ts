import { IsInt, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsInt()
  hall_id: number;

  @IsInt()
  user_id: number;

  @IsString()
  password: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean = true;
}
