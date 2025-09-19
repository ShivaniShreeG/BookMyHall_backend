import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthController } from './auth.controller';

@Module({
  providers: [UserService],
  controllers: [UserController,AuthController],
})
export class UserModule {}
