import { Module } from '@nestjs/common';
import { FoodModule } from '../food/food.module.js';
import { OnboardingModule } from '../onboarding/onboarding.module.js';
import { LogEntryController } from './log-entry.controller.js';
import { LogEntryService } from './log-entry.service.js';
import { LOG_ENTRY_REPOSITORY } from './log-entry.repository.js';
import { LogEntryRepositoryAdapter } from './log-entry.repository.adapter.js';

@Module({
  imports: [FoodModule, OnboardingModule],
  controllers: [LogEntryController],
  providers: [
    LogEntryService,
    {
      provide: LOG_ENTRY_REPOSITORY,
      useClass: LogEntryRepositoryAdapter,
    },
  ],
  exports: [LogEntryService],
})
export class LogEntryModule {}
