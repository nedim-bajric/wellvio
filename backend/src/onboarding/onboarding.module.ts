import { Module } from '@nestjs/common';
import { DietModule } from '../diet/diet.module.js';
import { OnboardingController } from './onboarding.controller.js';
import { OnboardingService } from './onboarding.service.js';
import { PROFILE_REPOSITORY } from './profile.repository.js';
import { ProfileRepositoryAdapter } from './profile.repository.adapter.js';
import { PLAN_REPOSITORY } from './plan.repository.js';
import { PlanRepositoryAdapter } from './plan.repository.adapter.js';

@Module({
  imports: [DietModule],
  controllers: [OnboardingController],
  providers: [
    OnboardingService,
    {
      provide: PROFILE_REPOSITORY,
      useClass: ProfileRepositoryAdapter,
    },
    {
      provide: PLAN_REPOSITORY,
      useClass: PlanRepositoryAdapter,
    },
  ],
  exports: [OnboardingService],
})
export class OnboardingModule {}
