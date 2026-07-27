import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DietModule } from './diet/diet.module.js';
import { FoodModule } from './food/food.module.js';
import { LogEntryModule } from './log-entry/log-entry.module.js';
import { OnboardingModule } from './onboarding/onboarding.module.js';

@Module({
  imports: [DietModule, FoodModule, LogEntryModule, OnboardingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
