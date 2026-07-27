import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DietModule } from './diet/diet.module.js';

@Module({
  imports: [DietModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
