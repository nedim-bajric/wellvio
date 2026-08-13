import { Injectable } from '@nestjs/common';
import { FoodService } from '../food/food.service.js';
import { LogEntryService } from '../log-entry/log-entry.service.js';
import { OnboardingService } from '../onboarding/onboarding.service.js';
import { WeightLogService } from '../weight-log/weight-log.service.js';

@Injectable()
export class AccountService {
  constructor(
    private readonly foodService: FoodService,
    private readonly logEntryService: LogEntryService,
    private readonly weightLogService: WeightLogService,
    private readonly onboardingService: OnboardingService,
  ) {}

  async deleteAccount(userId: string): Promise<void> {
    // Delete log entries before foods in case a persistent schema enforces
    // foreign keys from log entries to foods.
    await this.logEntryService.removeAllByUserId(userId);
    await this.foodService.removeAllByUserId(userId);
    await this.weightLogService.removeAllByUserId(userId);
    await this.onboardingService.deleteAccount(userId);
  }
}
