import type { Response } from 'express'; 
import { Controller, Post, Body, Res } from '@nestjs/common';
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

  if (!hallId || !userId || !oldPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'hallId, userId, oldPassword, and newPassword are required',
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

}
