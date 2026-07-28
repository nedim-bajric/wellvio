import { Test, TestingModule } from '@nestjs/testing';
import { WeightLogService } from './weight-log.service.js';
import { WEIGHT_LOG_REPOSITORY } from './weight-log.repository.js';
import { OnboardingService } from '../onboarding/onboarding.service.js';
import { WeightLogNotFoundError } from './weight-log-not-found.error.js';
import {
  ActivePlanRequiredError,
  AdjustmentRateMismatchError,
  InsufficientDataForAdjustmentError,
} from './weight-log-domain.error.js';
import type { WeightLogRepository } from './weight-log.repository.js';
import type { WeightLog } from './weight-log.types.js';
import type { Plan } from '../onboarding/onboarding.types.js';

describe('WeightLogService', () => {
  let service: WeightLogService;
  let repository: WeightLogRepository;
  let onboardingService: OnboardingService;
  const userId = 'user-1';

  const activePlan: Plan = {
    id: 'plan-1',
    userId,
    profileId: 'profile-1',
    targetCalories: 2000,
    targetNutrients: { calories: 2000, protein: 150, carbs: 200, fat: 67 },
    dailyDeficit: 500,
    daysToTarget: 70,
    rate: 'moderate',
    safe: true,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  function planOption(rate: Plan['rate'], targetCalories: number) {
    return {
      rate,
      targetCalories,
      targetNutrients: {
        calories: targetCalories,
        protein: targetCalories * 0.03,
        carbs: targetCalories * 0.05,
        fat: targetCalories * 0.02,
      },
      dailyDeficit: 2500 - targetCalories,
      daysToTarget: 70,
      safe: true,
    };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeightLogService,
        {
          provide: WEIGHT_LOG_REPOSITORY,
          useValue: {
            create: jest.fn(),
            findAllByUserId: jest.fn(),
            findAllByUserIdAndDateRange: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: OnboardingService,
          useValue: {
            getActivePlan: jest.fn(),
            getPlanOptionsAtWeight: jest.fn(),
            updateCurrentWeight: jest.fn(),
            activatePlan: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WeightLogService>(WeightLogService);
    repository = module.get<WeightLogRepository>(WEIGHT_LOG_REPOSITORY);
    onboardingService = module.get<OnboardingService>(OnboardingService);
  });

  function makeEntry(partial: Partial<WeightLog> = {}): WeightLog {
    const now = new Date();
    return {
      id: 'weight-1',
      userId,
      weightKg: 80,
      loggedAt: now,
      createdAt: now,
      updatedAt: now,
      ...partial,
    };
  }

  describe('create', () => {
    it('creates a weight log with default loggedAt', async () => {
      const created = makeEntry();
      jest.spyOn(repository, 'create').mockResolvedValue(created);

      const result = await service.create(userId, { weightKg: 80 });

      expect(result).toEqual(created);
      expect(repository.create).toHaveBeenCalledWith(userId, {
        weightKg: 80,
        loggedAt: expect.any(Date),
      });
    });
  });

  describe('findAll', () => {
    it('returns all weight logs for the user', async () => {
      jest
        .spyOn(repository, 'findAllByUserId')
        .mockResolvedValue([makeEntry()]);

      const results = await service.findAll(userId);

      expect(results).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('returns the entry when found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(makeEntry());

      const result = await service.findOne(userId, 'weight-1');

      expect(result).not.toBeNull();
    });

    it('returns null for a missing entry', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.findOne(userId, 'weight-1');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('updates an existing entry', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(makeEntry());
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue(makeEntry({ weightKg: 79 }));

      const result = await service.update(userId, 'weight-1', { weightKg: 79 });

      expect(result.weightKg).toBe(79);
    });

    it('throws when the entry does not exist', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(
        service.update(userId, 'weight-1', { weightKg: 79 }),
      ).rejects.toThrow(WeightLogNotFoundError);
    });
  });

  describe('remove', () => {
    it('removes an existing entry', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(makeEntry());
      jest.spyOn(repository, 'remove').mockResolvedValue(undefined);

      await service.remove(userId, 'weight-1');

      expect(repository.remove).toHaveBeenCalledWith(userId, 'weight-1');
    });

    it('throws when the entry does not exist', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.remove(userId, 'weight-1')).rejects.toThrow(
        WeightLogNotFoundError,
      );
    });
  });

  describe('analyzeTrend', () => {
    it('returns insufficientData when fewer than two entries', async () => {
      jest
        .spyOn(repository, 'findAllByUserId')
        .mockResolvedValue([makeEntry()]);
      jest
        .spyOn(onboardingService, 'getActivePlan')
        .mockResolvedValue(activePlan);

      const result = await service.analyzeTrend(userId);

      expect(result.trend).toBe('insufficientData');
      expect(result.plannedWeeklyChangeKg).toBe(-0.5);
    });

    it('returns onTrack when actual loss matches planned loss', async () => {
      jest.spyOn(repository, 'findAllByUserId').mockResolvedValue([
        makeEntry({
          id: 'w1',
          weightKg: 80,
          loggedAt: new Date('2026-07-13T08:00:00Z'),
        }),
        makeEntry({
          id: 'w2',
          weightKg: 79,
          loggedAt: new Date('2026-07-27T08:00:00Z'),
        }),
      ]);
      jest
        .spyOn(onboardingService, 'getActivePlan')
        .mockResolvedValue(activePlan);

      const result = await service.analyzeTrend(userId);

      expect(result.trend).toBe('onTrack');
      expect(result.actualWeeklyChangeKg).toBe(-0.5);
    });

    it('returns behind when actual loss is slower than planned', async () => {
      jest.spyOn(repository, 'findAllByUserId').mockResolvedValue([
        makeEntry({
          id: 'w1',
          weightKg: 80,
          loggedAt: new Date('2026-07-13T08:00:00Z'),
        }),
        makeEntry({
          id: 'w2',
          weightKg: 79.4,
          loggedAt: new Date('2026-07-27T08:00:00Z'),
        }),
      ]);
      jest
        .spyOn(onboardingService, 'getActivePlan')
        .mockResolvedValue(activePlan);

      const result = await service.analyzeTrend(userId);

      expect(result.trend).toBe('behind');
      expect(result.actualWeeklyChangeKg).toBe(-0.3);
    });

    it('returns ahead when actual loss is faster than planned', async () => {
      jest.spyOn(repository, 'findAllByUserId').mockResolvedValue([
        makeEntry({
          id: 'w1',
          weightKg: 80,
          loggedAt: new Date('2026-07-13T08:00:00Z'),
        }),
        makeEntry({
          id: 'w2',
          weightKg: 77,
          loggedAt: new Date('2026-07-27T08:00:00Z'),
        }),
      ]);
      jest
        .spyOn(onboardingService, 'getActivePlan')
        .mockResolvedValue(activePlan);

      const result = await service.analyzeTrend(userId);

      expect(result.trend).toBe('ahead');
      expect(result.actualWeeklyChangeKg).toBe(-1.5);
    });
  });

  describe('suggestAdjustment', () => {
    it('suggests a more aggressive plan when behind', async () => {
      jest.spyOn(repository, 'findAllByUserId').mockResolvedValue([
        makeEntry({
          id: 'w1',
          weightKg: 80,
          loggedAt: new Date('2026-07-13T08:00:00Z'),
        }),
        makeEntry({
          id: 'w2',
          weightKg: 79.5,
          loggedAt: new Date('2026-07-27T08:00:00Z'),
        }),
      ]);
      jest
        .spyOn(onboardingService, 'getActivePlan')
        .mockResolvedValue(activePlan);
      jest
        .spyOn(onboardingService, 'getPlanOptionsAtWeight')
        .mockResolvedValue({
          options: [
            planOption('mild', 2200),
            planOption('moderate', 2000),
            planOption('aggressive', 1800),
          ],
        });

      const result = await service.suggestAdjustment(userId);

      expect(result.currentPlan.rate).toBe('moderate');
      expect(result.suggestedPlan?.rate).toBe('aggressive');
      expect(result.requiresApproval).toBe(true);
    });

    it('suggests a milder plan when ahead', async () => {
      jest.spyOn(repository, 'findAllByUserId').mockResolvedValue([
        makeEntry({
          id: 'w1',
          weightKg: 80,
          loggedAt: new Date('2026-07-13T08:00:00Z'),
        }),
        makeEntry({
          id: 'w2',
          weightKg: 77,
          loggedAt: new Date('2026-07-27T08:00:00Z'),
        }),
      ]);
      jest
        .spyOn(onboardingService, 'getActivePlan')
        .mockResolvedValue(activePlan);
      jest
        .spyOn(onboardingService, 'getPlanOptionsAtWeight')
        .mockResolvedValue({
          options: [
            planOption('mild', 2200),
            planOption('moderate', 2000),
            planOption('aggressive', 1800),
          ],
        });

      const result = await service.suggestAdjustment(userId);

      expect(result.suggestedPlan?.rate).toBe('mild');
    });

    it('skips unsafe options and falls back to the next safe option', async () => {
      jest.spyOn(repository, 'findAllByUserId').mockResolvedValue([
        makeEntry({
          id: 'w1',
          weightKg: 80,
          loggedAt: new Date('2026-07-13T08:00:00Z'),
        }),
        makeEntry({
          id: 'w2',
          weightKg: 79.4,
          loggedAt: new Date('2026-07-27T08:00:00Z'),
        }),
      ]);
      jest.spyOn(onboardingService, 'getActivePlan').mockResolvedValue({
        ...activePlan,
        rate: 'mild',
      });
      jest
        .spyOn(onboardingService, 'getPlanOptionsAtWeight')
        .mockResolvedValue({
          options: [
            { ...planOption('mild', 2200), safe: true },
            { ...planOption('moderate', 2000), safe: false },
            { ...planOption('aggressive', 1800), safe: true },
          ],
        });

      const result = await service.suggestAdjustment(userId);

      expect(result.suggestedPlan?.rate).toBe('aggressive');
    });

    it('returns no suggestion when on track', async () => {
      jest.spyOn(repository, 'findAllByUserId').mockResolvedValue([
        makeEntry({
          id: 'w1',
          weightKg: 80,
          loggedAt: new Date('2026-07-13T08:00:00Z'),
        }),
        makeEntry({
          id: 'w2',
          weightKg: 79,
          loggedAt: new Date('2026-07-27T08:00:00Z'),
        }),
      ]);
      jest
        .spyOn(onboardingService, 'getActivePlan')
        .mockResolvedValue(activePlan);
      jest
        .spyOn(onboardingService, 'getPlanOptionsAtWeight')
        .mockResolvedValue({ options: [] });

      const result = await service.suggestAdjustment(userId);

      expect(result.suggestedPlan).toBeNull();
      expect(result.reason).toContain('on track');
    });

    it('returns no suggestion when data is insufficient', async () => {
      jest
        .spyOn(repository, 'findAllByUserId')
        .mockResolvedValue([makeEntry()]);
      jest
        .spyOn(onboardingService, 'getActivePlan')
        .mockResolvedValue(activePlan);

      const result = await service.suggestAdjustment(userId);

      expect(result.suggestedPlan).toBeNull();
      expect(result.reason).toContain('Log weight at least twice');
    });

    it('throws when there is no active plan', async () => {
      jest
        .spyOn(repository, 'findAllByUserId')
        .mockResolvedValue([makeEntry()]);
      jest.spyOn(onboardingService, 'getActivePlan').mockResolvedValue(null);

      await expect(service.suggestAdjustment(userId)).rejects.toThrow(
        ActivePlanRequiredError,
      );
    });
  });

  describe('applyAdjustment', () => {
    it('updates current weight and activates the suggested plan', async () => {
      const activatedPlan = { ...activePlan, rate: 'aggressive' as const };
      jest.spyOn(repository, 'findAllByUserId').mockResolvedValue([
        makeEntry({
          id: 'w1',
          weightKg: 80,
          loggedAt: new Date('2026-07-13T08:00:00Z'),
        }),
        makeEntry({
          id: 'w2',
          weightKg: 79.5,
          loggedAt: new Date('2026-07-27T08:00:00Z'),
        }),
      ]);
      jest
        .spyOn(onboardingService, 'getActivePlan')
        .mockResolvedValue(activePlan);
      jest.spyOn(onboardingService, 'updateCurrentWeight').mockResolvedValue({
        id: 'profile-1',
        userId,
        gender: 'male',
        age: 30,
        heightCm: 180,
        currentWeightKg: 79.5,
        goalWeightKg: 90,
        activityLevel: 'sedentary',
        targetDate: new Date(),
        healthDisclaimerAcknowledged: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      jest
        .spyOn(onboardingService, 'activatePlan')
        .mockResolvedValue(activatedPlan);
      jest
        .spyOn(onboardingService, 'getPlanOptionsAtWeight')
        .mockResolvedValue({
          options: [
            planOption('mild', 2200),
            planOption('moderate', 2000),
            planOption('aggressive', 1800),
          ],
        });

      const result = await service.applyAdjustment(userId, 'aggressive');

      expect(onboardingService.updateCurrentWeight).toHaveBeenCalledWith(
        userId,
        79.5,
      );
      expect(onboardingService.activatePlan).toHaveBeenCalledWith(
        userId,
        'aggressive',
      );
      expect(result.rate).toBe('aggressive');
    });

    it('throws when the requested rate does not match the suggestion', async () => {
      jest.spyOn(repository, 'findAllByUserId').mockResolvedValue([
        makeEntry({
          id: 'w1',
          weightKg: 80,
          loggedAt: new Date('2026-07-13T08:00:00Z'),
        }),
        makeEntry({
          id: 'w2',
          weightKg: 79.5,
          loggedAt: new Date('2026-07-27T08:00:00Z'),
        }),
      ]);
      jest
        .spyOn(onboardingService, 'getActivePlan')
        .mockResolvedValue(activePlan);
      jest
        .spyOn(onboardingService, 'getPlanOptionsAtWeight')
        .mockResolvedValue({
          options: [
            planOption('mild', 2200),
            planOption('moderate', 2000),
            planOption('aggressive', 1800),
          ],
        });

      await expect(service.applyAdjustment(userId, 'mild')).rejects.toThrow(
        AdjustmentRateMismatchError,
      );
    });

    it('throws when there is no active plan', async () => {
      jest
        .spyOn(repository, 'findAllByUserId')
        .mockResolvedValue([makeEntry()]);
      jest.spyOn(onboardingService, 'getActivePlan').mockResolvedValue(null);

      await expect(service.applyAdjustment(userId, 'moderate')).rejects.toThrow(
        ActivePlanRequiredError,
      );
    });

    it('throws when trend data is insufficient', async () => {
      jest
        .spyOn(repository, 'findAllByUserId')
        .mockResolvedValue([makeEntry()]);
      jest
        .spyOn(onboardingService, 'getActivePlan')
        .mockResolvedValue(activePlan);

      await expect(service.applyAdjustment(userId, 'moderate')).rejects.toThrow(
        InsufficientDataForAdjustmentError,
      );
    });
  });
});
