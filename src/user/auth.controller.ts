import type { Response } from 'express'; 
import { Controller, Post, Body, Res, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
async login(@Body() body: any, @Res() res: Response) {
  if (!body || body.userId === undefined || !body.password) {
    return res.status(400).json({
      success: false,
      message: 'userId and password are required',
    });
  }

  try {
    const hallId = body.hallId ? Number(body.hallId) : 0; // default 0 if missing
    const userId = Number(body.userId);
    const password = body.password;

    const result = await this.userService.login(hallId, userId, password);

    return res.status(200).json({
      success: result.success,
      message: result.message,
      user: result.user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || 'Login failed',
    });
  }
}
@Post('change-password')
async changePassword(@Body() body: any, @Res() res: Response) {
  const { hallId, userId, oldPassword, newPassword } = body;

 if (!userId) { 
      return res.status(400).json({ 
        success: false, message: 'userId is required'
       }); 
    }
     if (!oldPassword) {
       return res.status(400).json({ 
        success: false, message: 'oldPassword is required' 
      });
    } 
    if (!newPassword) { 
      return res.status(400).json({ 
        success: false, message: 'newPassword is required' 
      });
    }

  try {
    const result = await this.userService.changePassword(
      Number(hallId),
      Number(userId),
      oldPassword,
      newPassword,
    );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to change password',
    });
  }
}
@Post('send_otp')
  async sendOtp(@Body() body: { hall_id: number; user_id: number; otp: string }) {
    const { hall_id, user_id, otp } = body;

    // Input validation
    if (!hall_id || hall_id <= 0) {
      throw new BadRequestException({ status: 'error', message: 'Hall ID is required' });
    }
    if (!user_id || user_id <= 0) {
      throw new BadRequestException({ status: 'error', message: 'User ID is required' });
    }
    if (!otp) {
      throw new BadRequestException({ status: 'error', message: 'OTP is required' });
    }

    // Call service to send OTP
    return this.userService.sendOtp(hall_id, user_id, otp);
  }
  // ✅ Update password after OTP verification
  @Post('update_password')
  async updatePassword(@Body() body: { hall_id: number; user_id: number; newPassword: string }) {
    const { hall_id, user_id, newPassword } = body;

    // Input validation
    if (!hall_id || hall_id <= 0) {
      throw new BadRequestException({ status: 'error', message: 'Hall ID is required' });
    }
    if (!user_id || user_id <= 0) {
      throw new BadRequestException({ status: 'error', message: 'User ID is required' });
    }
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException({
        status: 'error',
        message: 'Password must be at least 6 characters long',
      });
    }

    // Call service to update password
    return this.userService.updatePassword(hall_id, user_id, newPassword);
  }

}
