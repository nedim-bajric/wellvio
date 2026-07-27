import { Test, TestingModule } from '@nestjs/testing';
import { WeightLogController } from './weight-log.controller.js';
import { WeightLogService } from './weight-log.service.js';
import { WeightLogNotFoundError } from './weight-log-not-found.error.js';
import type { WeightLog } from './weight-log.types.js';

describe('WeightLogController', () => {
  let controller: WeightLogController;
  let service: WeightLogService;
  const userId = 'user-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeightLogController],
      providers: [
        {
          provide: WeightLogService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            analyzeTrend: jest.fn(),
            suggestAdjustment: jest.fn(),
            applyAdjustment: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WeightLogController>(WeightLogController);
    service = module.get<WeightLogService>(WeightLogService);
  });

  function makeEntry(): WeightLog {
    const now = new Date();
    return {
      id: 'weight-1',
      userId,
      weightKg: 80,
      loggedAt: now,
      createdAt: now,
      updatedAt: now,
    };
  }

  describe('create', () => {
    it('creates a weight log for the user', async () => {
      const created = makeEntry();
      jest.spyOn(service, 'create').mockResolvedValue(created);

      const data = { weightKg: 80 };
      const result = await controller.create(userId, data);

      expect(service.create).toHaveBeenCalledWith(userId, data);
      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('lists weight logs for the user', async () => {
      const entries = [makeEntry()];
      jest.spyOn(service, 'findAll').mockResolvedValue(entries);

      const result = await controller.findAll(userId);

      expect(service.findAll).toHaveBeenCalledWith(userId);
      expect(result).toEqual(entries);
    });
  });

  describe('analyzeTrend', () => {
    it('returns trend analysis', async () => {
      const analysis = {
        latestWeightKg: 79,
        earliestWeightKg: 80,
        daysTracked: 14,
        actualDailyChangeKg: -0.1,
        actualWeeklyChangeKg: -0.5,
        plannedWeeklyChangeKg: -0.5,
        trend: 'onTrack' as const,
      };
      jest.spyOn(service, 'analyzeTrend').mockResolvedValue(analysis);

      const result = await controller.analyzeTrend(userId);

      expect(service.analyzeTrend).toHaveBeenCalledWith(userId);
      expect(result).toEqual(analysis);
    });
  });

  describe('suggestAdjustment', () => {
    it('returns adjustment suggestion', async () => {
      const suggestion = {
        currentPlan: {
          rate: 'moderate' as const,
          targetCalories: 2000,
          targetNutrients: {
            calories: 2000,
            protein: 150,
            carbs: 200,
            fat: 67,
          },
        },
        suggestedPlan: {
          rate: 'aggressive' as const,
          targetCalories: 1800,
          targetNutrients: {
            calories: 1800,
            protein: 135,
            carbs: 180,
            fat: 60,
          },
        },
        reason: 'You are losing weight slower than planned.',
        requiresApproval: true as const,
      };
      jest.spyOn(service, 'suggestAdjustment').mockResolvedValue(suggestion);

      const result = await controller.suggestAdjustment(userId);

      expect(service.suggestAdjustment).toHaveBeenCalledWith(userId);
      expect(result).toEqual(suggestion);
    });
  });

  describe('applyAdjustment', () => {
    it('applies the approved adjustment', async () => {
      const plan = {
        id: 'plan-2',
        userId,
        profileId: 'profile-1',
        targetCalories: 1800,
        targetNutrients: { calories: 1800, protein: 135, carbs: 180, fat: 60 },
        dailyDeficit: 700,
        daysToTarget: 70,
        rate: 'aggressive' as const,
        safe: true,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(service, 'applyAdjustment').mockResolvedValue(plan);

      const result = await controller.applyAdjustment(userId, {
        rate: 'aggressive',
      });

      expect(service.applyAdjustment).toHaveBeenCalledWith(
        userId,
        'aggressive',
      );
      expect(result).toEqual(plan);
    });
  });

  describe('findOne', () => {
    it('returns a single weight log', async () => {
      const entry = makeEntry();
      jest.spyOn(service, 'findOne').mockResolvedValue(entry);

      const result = await controller.findOne(userId, 'weight-1');

      expect(service.findOne).toHaveBeenCalledWith(userId, 'weight-1');
      expect(result).toEqual(entry);
    });

    it('throws WeightLogNotFoundError when the entry is missing', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(controller.findOne(userId, 'weight-1')).rejects.toThrow(
        WeightLogNotFoundError,
      );
    });
  });

  describe('update', () => {
    it('updates a weight log for the user', async () => {
      const updated = makeEntry();
      jest.spyOn(service, 'update').mockResolvedValue(updated);

      const result = await controller.update(userId, 'weight-1', {
        weightKg: 79,
      });

      expect(service.update).toHaveBeenCalledWith(userId, 'weight-1', {
        weightKg: 79,
      });
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('deletes a weight log for the user', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await controller.remove(userId, 'weight-1');

      expect(service.remove).toHaveBeenCalledWith(userId, 'weight-1');
    });
  });
});
