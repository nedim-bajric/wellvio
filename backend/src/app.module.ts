import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DietModule } from './diet/diet.module.js';
import { FoodModule } from './food/food.module.js';

@Module({
  imports: [DietModule, FoodModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
