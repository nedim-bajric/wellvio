import { Module } from '@nestjs/common';
import { DietService } from './diet.service.js';

@Module({
  providers: [DietService],
  exports: [DietService],
})
export class DietModule {}
