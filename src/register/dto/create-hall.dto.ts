import { IsNotEmpty, IsEmail, IsString, IsNumber ,IsOptional} from 'class-validator';

export class CreateHallOwnerDto {
  @IsString()
  @IsNotEmpty()
  hall_name: string;

  @IsString()
  @IsNotEmpty()
  hall_phone: string;

  @IsEmail()
  hall_email: string;

  @IsString()
  @IsNotEmpty()
  hall_address: string;

  @IsNumber()
  user_id: number;

  @IsNumber()
  hall_id: number;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  owner_name: string;

  @IsString()
  @IsNotEmpty()
  owner_phone: string;

  @IsEmail()
  owner_email: string;

  @IsOptional()
  @IsString()
  hall_logo?: string;
}
