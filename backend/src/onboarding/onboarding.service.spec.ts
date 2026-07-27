import { Test, TestingModule } from '@nestjs/testing';
import { OnboardingService } from './onboarding.service.js';
import { DietService } from '../diet/diet.service.js';
import { PROFILE_REPOSITORY } from './profile.repository.js';
import { PLAN_REPOSITORY } from './plan.repository.js';
import {
  HealthDisclaimerRequiredError,
  ProfileNotFoundError,
  UnsafePlanError,
} from './onboarding.errors.js';
import type { ProfileRepository } from './profile.repository.js';
import type { PlanRepository } from './plan.repository.js';
import type { Plan, Profile } from './onboarding.types.js';

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function createProfileData(partial: Partial<Profile> = {}) {
  return {
    gender: 'male' as const,
    age: 30,
    heightCm: 180,
    currentWeightKg: 100,
    goalWeightKg: 90,
    activityLevel: 'sedentary' as const,
    targetDate: daysFromNow(180),
    healthDisclaimerAcknowledged: false,
    ...partial,
  };
}

function profileEntity(
  userId: string,
  partial: Partial<Profile> = {},
): Profile {
  return {
    id: 'profile-1',
    userId,
    ...createProfileData(partial),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('OnboardingService', () => {
  let service: OnboardingService;
  let profileRepository: ProfileRepository;
  let planRepository: PlanRepository;
  const userId = 'user-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingService,
        DietService,
        {
          provide: PROFILE_REPOSITORY,
          useValue: {
            create: jest.fn(),
            findByUserId: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: PLAN_REPOSITORY,
          useValue: {
            create: jest.fn(),
            findActiveByUserId: jest.fn(),
            findByUserId: jest.fn(),
            deactivateAll: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OnboardingService>(OnboardingService);
    profileRepository = module.get<ProfileRepository>(PROFILE_REPOSITORY);
    planRepository = module.get<PlanRepository>(PLAN_REPOSITORY);
  });

  describe('upsertProfile', () => {
    it('creates a profile when none exists', async () => {
      const data = createProfileData();
      const created = profileEntity(userId, data);
      jest.spyOn(profileRepository, 'findByUserId').mockResolvedValue(null);
      jest.spyOn(profileRepository, 'create').mockResolvedValue(created);

      const result = await service.upsertProfile(userId, data);

      expect(profileRepository.create).toHaveBeenCalledWith(userId, data);
      expect(result).toEqual(created);
    });

    it('updates the profile when one already exists', async () => {
      const existing = profileEntity(userId);
      const updateData = { currentWeightKg: 95 };
      const updated = profileEntity(userId, updateData);
      jest.spyOn(profileRepository, 'findByUserId').mockResolvedValue(existing);
      jest.spyOn(profileRepository, 'update').mockResolvedValue(updated);

      const result = await service.upsertProfile(userId, updateData);

      expect(profileRepository.update).toHaveBeenCalledWith(userId, updateData);
      expect(result).toEqual(updated);
    });
  });

  describe('getProfile', () => {
    it('returns the profile when found', async () => {
      const existing = profileEntity(userId);
      jest.spyOn(profileRepository, 'findByUserId').mockResolvedValue(existing);

      const result = await service.getProfile(userId);

      expect(result).toEqual(existing);
    });

    it('returns null when no profile exists', async () => {
      jest.spyOn(profileRepository, 'findByUserId').mockResolvedValue(null);

      const result = await service.getProfile(userId);

      expect(result).toBeNull();
    });
  });

  describe('getPlanOptions', () => {
    it('returns safe plan options for a feasible profile', async () => {
      const existing = profileEntity(userId);
      jest.spyOn(profileRepository, 'findByUserId').mockResolvedValue(existing);

      const result = await service.getPlanOptions(userId);

      expect(result.options).toHaveLength(3);
      expect(result.options.map((o) => o.rate)).toEqual([
        'mild',
        'moderate',
        'aggressive',
      ]);
      expect(result.options.every((o) => o.safe)).toBe(true);
    });

    it('throws UnsafePlanError when the target date is infeasible', async () => {
      const existing = profileEntity(userId, {
        currentWeightKg: 100,
        goalWeightKg: 70,
        targetDate: daysFromNow(30),
      });
      jest.spyOn(profileRepository, 'findByUserId').mockResolvedValue(existing);

      await expect(service.getPlanOptions(userId)).rejects.toThrow(
        UnsafePlanError,
      );
    });

    it('throws ProfileNotFoundError when no profile exists', async () => {
      jest.spyOn(profileRepository, 'findByUserId').mockResolvedValue(null);

      await expect(service.getPlanOptions(userId)).rejects.toThrow(
        ProfileNotFoundError,
      );
    });
  });

  describe('activatePlan', () => {
    it('activates the chosen plan when the disclaimer is acknowledged', async () => {
      const existing = profileEntity(userId, {
        healthDisclaimerAcknowledged: true,
      });
      const createdPlan: Plan = {
        id: 'plan-1',
        userId,
        profileId: existing.id,
        targetCalories: 1800,
        targetNutrients: {
          calories: 1800,
          protein: 135,
          carbs: 180,
          fat: 60,
        },
        dailyDeficit: 300,
        daysToTarget: expect.any(Number),
        rate: 'moderate',
        safe: true,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(profileRepository, 'findByUserId').mockResolvedValue(existing);
      jest.spyOn(planRepository, 'deactivateAll').mockResolvedValue(undefined);
      jest.spyOn(planRepository, 'create').mockResolvedValue(createdPlan);

      const result = await service.activatePlan(userId, 'moderate');

      expect(planRepository.deactivateAll).toHaveBeenCalledWith(userId);
      expect(planRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          profileId: existing.id,
          active: true,
          rate: 'moderate',
          safe: true,
        }),
      );
      expect(result).toEqual(createdPlan);
    });

    it('throws HealthDisclaimerRequiredError when disclaimer is not acknowledged', async () => {
      const existing = profileEntity(userId, {
        healthDisclaimerAcknowledged: false,
      });
      jest.spyOn(profileRepository, 'findByUserId').mockResolvedValue(existing);

      await expect(service.activatePlan(userId, 'moderate')).rejects.toThrow(
        HealthDisclaimerRequiredError,
      );
    });

    it('throws UnsafePlanError when the selected rate drops below the safety floor', async () => {
      const existing = profileEntity(userId, {
        gender: 'female',
        age: 30,
        heightCm: 165,
        currentWeightKg: 55,
        goalWeightKg: 50,
        healthDisclaimerAcknowledged: true,
      });
      jest.spyOn(profileRepository, 'findByUserId').mockResolvedValue(existing);

      await expect(service.activatePlan(userId, 'aggressive')).rejects.toThrow(
        UnsafePlanError,
      );
    });
  });

  describe('getActivePlan', () => {
    it('returns the active plan', async () => {
      const activePlan: Plan = {
        id: 'plan-1',
        userId,
        profileId: 'profile-1',
        targetCalories: 1800,
        targetNutrients: {
          calories: 1800,
          protein: 135,
          carbs: 180,
          fat: 60,
        },
        dailyDeficit: 300,
        daysToTarget: 90,
        rate: 'moderate',
        safe: true,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(planRepository, 'findActiveByUserId')
        .mockResolvedValue(activePlan);

      const result = await service.getActivePlan(userId);

      expect(result).toEqual(activePlan);
    });
  });
});
