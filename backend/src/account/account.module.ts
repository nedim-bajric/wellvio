import { Module } from '@nestjs/common';
import { FoodModule } from '../food/food.module.js';
import { LogEntryModule } from '../log-entry/log-entry.module.js';
import { OnboardingModule } from '../onboarding/onboarding.module.js';
import { WeightLogModule } from '../weight-log/weight-log.module.js';
import { AccountController } from './account.controller.js';
import { AccountService } from './account.service.js';

@Module({
  imports: [FoodModule, LogEntryModule, OnboardingModule, WeightLogModule],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
