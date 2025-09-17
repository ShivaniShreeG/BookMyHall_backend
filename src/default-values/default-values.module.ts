import { Module } from '@nestjs/common';
import { DefaultValuesService } from './default-values.service';
import { DefaultValuesController } from './default-values.controller';

@Module({
  providers: [DefaultValuesService],
  controllers: [DefaultValuesController],
})
export class DefaultValuesModule {}
