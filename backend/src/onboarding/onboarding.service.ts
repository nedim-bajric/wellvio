import { Inject, Injectable } from '@nestjs/common';
import { DietService } from '../diet/diet.service.js';
import { PROFILE_REPOSITORY } from './profile.repository.js';
import { PLAN_REPOSITORY } from './plan.repository.js';
import type { ProfileRepository } from './profile.repository.js';
import type { PlanRepository } from './plan.repository.js';
import {
  CreateProfileData,
  Plan,
  PlanOption,
  PlanOptionsResult,
  Profile,
  UpdateProfileData,
} from './onboarding.types.js';
import {
  HealthDisclaimerRequiredError,
  ProfileNotFoundError,
  UnsafePlanError,
} from './onboarding.errors.js';
import { UserProfile } from '../diet/diet.types.js';

@Injectable()
export class OnboardingService {
  constructor(
    private readonly dietService: DietService,
    @Inject(PROFILE_REPOSITORY)
    private readonly profileRepository: ProfileRepository,
    @Inject(PLAN_REPOSITORY) private readonly planRepository: PlanRepository,
  ) {}

  async upsertProfile(
    userId: string,
    data: CreateProfileData | UpdateProfileData,
  ): Promise<Profile> {
    const existing = await this.profileRepository.findByUserId(userId);
    if (existing) {
      return this.profileRepository.update(userId, data);
    }
    return this.profileRepository.create(userId, data as CreateProfileData);
  }

  async getProfile(userId: string): Promise<Profile | null> {
    return this.profileRepository.findByUserId(userId);
  }

  async getPlanOptions(userId: string): Promise<PlanOptionsResult> {
    const { userProfile } = await this.requireProfileWithInputs(userId);
    this.requireFeasible(userProfile);

    const options: PlanOption[] = this.dietService
      .generatePlanOptions(userProfile)
      .map((plan) => ({
        rate: plan.rate,
        targetCalories: plan.targetCalories,
        targetNutrients: plan.targetNutrients,
        dailyDeficit: plan.dailyDeficit,
        daysToTarget: plan.daysToTarget,
        safe: plan.safe,
      }));

    return { options };
  }

  async activatePlan(userId: string, rate: PlanOption['rate']): Promise<Plan> {
    const { profile, userProfile } =
      await this.requireProfileWithInputs(userId);

    if (!profile.healthDisclaimerAcknowledged) {
      throw new HealthDisclaimerRequiredError();
    }

    this.requireFeasible(userProfile);

    const chosen = this.dietService
      .generatePlanOptions(userProfile)
      .find((option) => option.rate === rate);

    if (!chosen) {
      throw new UnsafePlanError(
        `The selected plan rate (${rate}) is not available or would drop below the safety floor.`,
      );
    }

    await this.planRepository.deactivateAll(userId);

    return this.planRepository.create({
      userId,
      profileId: profile.id,
      targetCalories: chosen.targetCalories,
      targetNutrients: chosen.targetNutrients,
      dailyDeficit: chosen.dailyDeficit,
      daysToTarget: chosen.daysToTarget,
      rate: chosen.rate,
      safe: chosen.safe,
      active: true,
    });
  }

  async getActivePlan(userId: string): Promise<Plan | null> {
    return this.planRepository.findActiveByUserId(userId);
  }

  private async requireProfileWithInputs(
    userId: string,
  ): Promise<{ profile: Profile; userProfile: UserProfile }> {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throw new ProfileNotFoundError(userId);
    }
    return { profile, userProfile: this.toUserProfile(profile) };
  }

  private requireFeasible(userProfile: UserProfile): void {
    const feasibility = this.dietService.checkFeasibility(userProfile);
    if (!feasibility.feasible) {
      throw new UnsafePlanError(
        feasibility.message,
        feasibility.minimumSafeDays,
      );
    }
  }

  private toUserProfile(profile: Profile): UserProfile {
    return {
      gender: profile.gender,
      age: profile.age,
      heightCm: profile.heightCm,
      currentWeightKg: profile.currentWeightKg,
      goalWeightKg: profile.goalWeightKg,
      activityLevel: profile.activityLevel,
      targetDate: profile.targetDate,
    };
  }
}
