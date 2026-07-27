import { Module } from '@nestjs/common';
import { FoodController } from './food.controller.js';
import { FoodService } from './food.service.js';
import { FOOD_REPOSITORY } from './food.repository.js';
import { FoodRepositoryAdapter } from './food.repository.adapter.js';

@Module({
  controllers: [FoodController],
  providers: [
    FoodService,
    {
      provide: FOOD_REPOSITORY,
      useClass: FoodRepositoryAdapter,
    },
  ],
  exports: [FoodService],
})
export class FoodModule {}
