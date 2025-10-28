// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { TwilioController } from './twillo.controller';
import { TwilioService } from '../twillo/twillo.service';

@Module({
  controllers: [TwilioController],
  providers: [TwilioService],
  exports: [],
})
export class TwilioModule {}
