import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { OnboardingService } from './onboarding.service.js';
import { OnboardingErrorFilter } from './onboarding-error.filter.js';
import { ProfileNotFoundError } from './onboarding.errors.js';
import { ActivatePlanDto, CreateProfileDto } from './onboarding.dto.js';
import type { PlanOptionsResult, Plan, Profile } from './onboarding.types.js';

@Controller('onboarding')
@UseFilters(OnboardingErrorFilter)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('profile')
  @UsePipes(new ValidationPipe({ transform: true }))
  upsertProfile(
    @Headers('x-user-id') userId: string,
    @Body() data: CreateProfileDto,
  ): Promise<Profile> {
    return this.onboardingService.upsertProfile(userId, data);
  }

  @Get('profile')
  async getProfile(@Headers('x-user-id') userId: string): Promise<Profile> {
    const profile = await this.onboardingService.getProfile(userId);
    if (!profile) {
      // The filter will convert the thrown error to a 404.
      throw new ProfileNotFoundError(userId);
    }
    return profile;
  }

  @Post('plan-options')
  getPlanOptions(
    @Headers('x-user-id') userId: string,
  ): Promise<PlanOptionsResult> {
    return this.onboardingService.getPlanOptions(userId);
  }

  @Post('activate-plan')
  @UsePipes(new ValidationPipe({ transform: true }))
  activatePlan(
    @Headers('x-user-id') userId: string,
    @Body() dto: ActivatePlanDto,
  ): Promise<Plan> {
    return this.onboardingService.activatePlan(userId, dto.rate);
  }

  @Get('active-plan')
  getActivePlan(@Headers('x-user-id') userId: string): Promise<Plan | null> {
    return this.onboardingService.getActivePlan(userId);
  }
}
