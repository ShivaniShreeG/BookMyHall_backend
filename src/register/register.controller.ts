import { Controller, Post, Body, Get, Param, BadRequestException ,NotFoundException} from '@nestjs/common';
import { RegisterService } from './register.service';
import { CreateHallOwnerDto } from './dto/create-hall.dto';

@Controller('register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @Post('create')
  async createHallWithOwner(@Body() dto: CreateHallOwnerDto) {
    return this.registerService.createHallWithOwner(dto);
  }
  // register.controller.ts
@Get('check-hall/:hall_id')
async checkHallExists(@Param('hall_id') hall_id: number) {
  const hall = await this.registerService.findHallById(+hall_id);
  return { exists: !!hall };
}
 @Post('send_otp')
  async sendOtp(@Body() body: { email: string; otp: string }) {
    const { email, otp } = body;
    if (!email || !otp) {
      throw new BadRequestException({ status: 'error', message: 'Email and OTP are required' });
    }
    return this.registerService.sendOtp(email, otp);
  }

  // ✅ Verify OTP
  @Post('verify_otp')
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    const { email, otp } = body;
    if (!email || !otp) {
      throw new BadRequestException({ status: 'error', message: 'Email and OTP are required' });
    }

    const valid = await this.registerService.verifyOtp(email, otp);
    if (!valid) {
      throw new NotFoundException({ status: 'error', message: 'Invalid or expired OTP' });
    }

    return { status: 'success', message: 'OTP verified successfully' };
  }

}
