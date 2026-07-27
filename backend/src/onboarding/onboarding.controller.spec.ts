import { Test, TestingModule } from '@nestjs/testing';
import { OnboardingController } from './onboarding.controller.js';
import { OnboardingService } from './onboarding.service.js';
import { ProfileNotFoundError } from './onboarding.errors.js';
import type { Plan, Profile } from './onboarding.types.js';

function profileEntity(userId: string): Profile {
  return {
    id: 'profile-1',
    userId,
    gender: 'male',
    age: 30,
    heightCm: 180,
    currentWeightKg: 90,
    goalWeightKg: 85,
    activityLevel: 'sedentary',
    targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    healthDisclaimerAcknowledged: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('OnboardingController', () => {
  let controller: OnboardingController;
  let service: OnboardingService;
  const userId = 'user-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OnboardingController],
      providers: [
        {
          provide: OnboardingService,
          useValue: {
            upsertProfile: jest.fn(),
            getProfile: jest.fn(),
            getPlanOptions: jest.fn(),
            activatePlan: jest.fn(),
            getActivePlan: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OnboardingController>(OnboardingController);
    service = module.get<OnboardingService>(OnboardingService);
  });

  describe('upsertProfile', () => {
    it('creates or updates the profile for the user', async () => {
      const data = {
        gender: 'male' as const,
        age: 30,
        heightCm: 180,
        currentWeightKg: 90,
        goalWeightKg: 85,
        activityLevel: 'sedentary' as const,
        targetDate: new Date(),
        healthDisclaimerAcknowledged: true,
      };
      const created = profileEntity(userId);
      jest.spyOn(service, 'upsertProfile').mockResolvedValue(created);

      const result = await controller.upsertProfile(userId, data);

      expect(service.upsertProfile).toHaveBeenCalledWith(userId, data);
      expect(result).toEqual(created);
    });
  });

  describe('getProfile', () => {
    it('returns the profile when found', async () => {
      const existing = profileEntity(userId);
      jest.spyOn(service, 'getProfile').mockResolvedValue(existing);

      const result = await controller.getProfile(userId);

      expect(service.getProfile).toHaveBeenCalledWith(userId);
      expect(result).toEqual(existing);
    });

    it('throws ProfileNotFoundError when the profile is missing', async () => {
      jest.spyOn(service, 'getProfile').mockResolvedValue(null);

      await expect(controller.getProfile(userId)).rejects.toThrow(
        ProfileNotFoundError,
      );
    });
  });

  describe('getPlanOptions', () => {
    it('returns plan options for the user', async () => {
      const options = {
        options: [
          {
            rate: 'mild' as const,
            targetCalories: 2000,
            targetNutrients: {
              calories: 2000,
              protein: 150,
              carbs: 200,
              fat: 66.7,
            },
            dailyDeficit: 200,
            daysToTarget: 385,
            safe: true,
          },
        ],
      };
      jest.spyOn(service, 'getPlanOptions').mockResolvedValue(options);

      const result = await controller.getPlanOptions(userId);

      expect(service.getPlanOptions).toHaveBeenCalledWith(userId);
      expect(result).toEqual(options);
    });
  });

  describe('activatePlan', () => {
    it('activates the selected plan', async () => {
      const activatedPlan: Plan = {
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
      jest.spyOn(service, 'activatePlan').mockResolvedValue(activatedPlan);

      const result = await controller.activatePlan(userId, {
        rate: 'moderate',
      });

      expect(service.activatePlan).toHaveBeenCalledWith(userId, 'moderate');
      expect(result).toEqual(activatedPlan);
    });
  });

  describe('getActivePlan', () => {
    it('returns the active plan for the user', async () => {
      const plan: Plan = {
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
      jest.spyOn(service, 'getActivePlan').mockResolvedValue(plan);

      const result = await controller.getActivePlan(userId);

      expect(service.getActivePlan).toHaveBeenCalledWith(userId);
      expect(result).toEqual(plan);
    });
  });
});
