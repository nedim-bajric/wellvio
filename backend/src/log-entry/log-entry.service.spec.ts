import { Test, TestingModule } from '@nestjs/testing';
import { LogEntryService } from './log-entry.service.js';
import { LOG_ENTRY_REPOSITORY } from './log-entry.repository.js';
import { FoodService } from '../food/food.service.js';
import { OnboardingService } from '../onboarding/onboarding.service.js';
import { LogEntryNotFoundError } from './log-entry-not-found.error.js';
import { FoodNotFoundError } from '../food/food-not-found.error.js';
import type { LogEntryRepository } from './log-entry.repository.js';
import type { LogEntry } from './log-entry.types.js';
import type { Food } from '../food/food.types.js';
import type { Plan } from '../onboarding/onboarding.types.js';

describe('LogEntryService', () => {
  let service: LogEntryService;
  let repository: LogEntryRepository;
  let foodService: FoodService;
  let onboardingService: OnboardingService;
  const userId = 'user-1';

  const apple: Food = {
    id: 'food-apple',
    userId,
    name: 'Apple',
    nutrientsPer100g: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const oats: Food = {
    id: 'food-oats',
    userId,
    name: 'Oats',
    nutrientsPer100g: { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9 },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const activePlan: Plan = {
    id: 'plan-1',
    userId,
    profileId: 'profile-1',
    targetCalories: 2000,
    targetNutrients: { calories: 2000, protein: 150, carbs: 250, fat: 67 },
    dailyDeficit: 500,
    daysToTarget: 30,
    rate: 'moderate',
    safe: true,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogEntryService,
        {
          provide: LOG_ENTRY_REPOSITORY,
          useValue: {
            create: jest.fn(),
            findAllByUserIdAndDate: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: FoodService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: OnboardingService,
          useValue: {
            getActivePlan: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LogEntryService>(LogEntryService);
    repository = module.get<LogEntryRepository>(LOG_ENTRY_REPOSITORY);
    foodService = module.get<FoodService>(FoodService);
    onboardingService = module.get<OnboardingService>(OnboardingService);
  });

  function makeEntry(partial: Partial<LogEntry> = {}): LogEntry {
    const now = new Date();
    return {
      id: 'entry-1',
      userId,
      foodId: apple.id,
      foodName: '',
      grams: 100,
      nutrients: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      mealSlot: 'breakfast',
      loggedAt: now,
      createdAt: now,
      updatedAt: now,
      ...partial,
    };
  }

  describe('create', () => {
    it('creates and enriches a log entry from the food catalog', async () => {
      jest.spyOn(foodService, 'findOne').mockResolvedValue(apple);
      jest.spyOn(repository, 'create').mockResolvedValue(makeEntry());

      const result = await service.create(userId, {
        foodId: apple.id,
        grams: 100,
        mealSlot: 'breakfast',
      });

      expect(result.foodName).toBe('Apple');
      expect(result.nutrients).toEqual({
        calories: 52,
        protein: 0.3,
        carbs: 14,
        fat: 0.2,
      });
    });

    it('throws when the food does not exist', async () => {
      jest.spyOn(foodService, 'findOne').mockResolvedValue(null);

      await expect(
        service.create(userId, { foodId: 'missing', grams: 100, mealSlot: 'breakfast' }),
      ).rejects.toThrow(FoodNotFoundError);
    });
  });

  describe('findAllByDate', () => {
    it('enriches entries with food data', async () => {
      jest
        .spyOn(repository, 'findAllByUserIdAndDate')
        .mockResolvedValue([makeEntry()]);
      jest.spyOn(foodService, 'findOne').mockResolvedValue(apple);

      const results = await service.findAllByDate(userId, new Date());

      expect(results).toHaveLength(1);
      expect(results[0].foodName).toBe('Apple');
    });
  });

  describe('findOne', () => {
    it('returns the enriched entry', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(makeEntry());
      jest.spyOn(foodService, 'findOne').mockResolvedValue(apple);

      const result = await service.findOne(userId, 'entry-1');

      expect(result?.foodName).toBe('Apple');
    });

    it('returns null for a missing entry', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.findOne(userId, 'entry-1');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('updates and re-enriches the entry', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(makeEntry());
      jest.spyOn(repository, 'update').mockResolvedValue(makeEntry({ grams: 200 }));
      jest.spyOn(foodService, 'findOne').mockResolvedValue(apple);

      const result = await service.update(userId, 'entry-1', { grams: 200 });

      expect(result.nutrients.calories).toBe(104);
    });

    it('throws when the entry does not exist', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(
        service.update(userId, 'entry-1', { grams: 200 }),
      ).rejects.toThrow(LogEntryNotFoundError);
    });
  });

  describe('remove', () => {
    it('removes an existing entry', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(makeEntry());
      jest.spyOn(repository, 'remove').mockResolvedValue(undefined);

      await service.remove(userId, 'entry-1');

      expect(repository.remove).toHaveBeenCalledWith(userId, 'entry-1');
    });

    it('throws when the entry does not exist', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.remove(userId, 'entry-1')).rejects.toThrow(
        LogEntryNotFoundError,
      );
    });
  });

  describe('getDailyDashboard', () => {
    it('returns totals, targets, remaining, and meal-slot breakdown', async () => {
      const today = new Date();
      jest
        .spyOn(repository, 'findAllByUserIdAndDate')
        .mockResolvedValue([
          makeEntry({
            foodId: apple.id,
            grams: 100,
            mealSlot: 'breakfast',
          }),
          makeEntry({
            id: 'entry-2',
            foodId: oats.id,
            grams: 50,
            mealSlot: 'breakfast',
          }),
        ]);
      jest
        .spyOn(foodService, 'findOne')
        .mockImplementation(async (_userId, foodId) =>
          foodId === apple.id ? apple : oats,
        );
      jest.spyOn(onboardingService, 'getActivePlan').mockResolvedValue(activePlan);

      const dashboard = await service.getDailyDashboard(userId, today);

      expect(dashboard.totals).toEqual({
        calories: 246.5,
        protein: 8.8,
        carbs: 47.2,
        fat: 3.7,
      });
      expect(dashboard.targets).toEqual(activePlan.targetNutrients);
      expect(dashboard.remaining).toEqual({
        calories: 1753.5,
        protein: 141.2,
        carbs: 202.8,
        fat: 63.3,
      });
      expect(dashboard.mealSlots).toHaveLength(4);
      const breakfast = dashboard.mealSlots.find((s) => s.mealSlot === 'breakfast');
      expect(breakfast?.nutrients.calories).toBe(246.5);
    });

    it('returns null targets when there is no active plan', async () => {
      jest.spyOn(repository, 'findAllByUserIdAndDate').mockResolvedValue([]);
      jest.spyOn(onboardingService, 'getActivePlan').mockResolvedValue(null);

      const dashboard = await service.getDailyDashboard(userId, new Date());

      expect(dashboard.totals).toEqual({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      });
      expect(dashboard.targets).toBeNull();
      expect(dashboard.remaining).toBeNull();
    });
  });
});
