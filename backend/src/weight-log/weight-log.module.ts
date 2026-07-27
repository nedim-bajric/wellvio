import { Module } from '@nestjs/common';
import { OnboardingModule } from '../onboarding/onboarding.module.js';
import { WeightLogController } from './weight-log.controller.js';
import { WeightLogService } from './weight-log.service.js';
import { WEIGHT_LOG_REPOSITORY } from './weight-log.repository.js';
import { WeightLogRepositoryAdapter } from './weight-log.repository.adapter.js';

@Module({
  imports: [OnboardingModule],
  controllers: [WeightLogController],
  providers: [
    WeightLogService,
    {
      provide: WEIGHT_LOG_REPOSITORY,
      useClass: WeightLogRepositoryAdapter,
    },
  ],
  exports: [WeightLogService],
})
export class WeightLogModule {}
