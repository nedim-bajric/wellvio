import { Inject, Injectable } from '@nestjs/common';
import { FoodService } from '../food/food.service.js';
import { OnboardingService } from '../onboarding/onboarding.service.js';
import { scaleNutrients } from '../diet/diet.calculations.js';
import { startOfDayUtc } from '../common/date.util.js';
import { LOG_ENTRY_REPOSITORY } from './log-entry.repository.js';
import type { LogEntryRepository } from './log-entry.repository.js';
import { LogEntryNotFoundError } from './log-entry-not-found.error.js';
import { FoodNotFoundError } from '../food/food-not-found.error.js';
import {
  CreateLogEntryData,
  DailyDashboard,
  LogEntry,
  MealSlot,
  MEAL_SLOTS,
  MealSlotSummary,
  UpdateLogEntryData,
} from './log-entry.types.js';
import { Nutrients } from '../diet/diet.types.js';

function zeroNutrients(): Nutrients {
  return { calories: 0, protein: 0, carbs: 0, fat: 0 };
}

function addNutrients(a: Nutrients, b: Nutrients): Nutrients {
  return {
    calories: round(a.calories + b.calories),
    protein: round(a.protein + b.protein),
    carbs: round(a.carbs + b.carbs),
    fat: round(a.fat + b.fat),
  };
}

function subtractNutrients(a: Nutrients, b: Nutrients): Nutrients {
  return {
    calories: round(a.calories - b.calories),
    protein: round(a.protein - b.protein),
    carbs: round(a.carbs - b.carbs),
    fat: round(a.fat - b.fat),
  };
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

@Injectable()
export class LogEntryService {
  constructor(
    @Inject(LOG_ENTRY_REPOSITORY)
    private readonly repository: LogEntryRepository,
    private readonly foodService: FoodService,
    private readonly onboardingService: OnboardingService,
  ) {}

  async create(userId: string, data: CreateLogEntryData): Promise<LogEntry> {
    const food = await this.requireFood(userId, data.foodId);
    const normalizedData: CreateLogEntryData = {
      ...data,
      loggedAt: data.loggedAt ? new Date(data.loggedAt) : new Date(),
    };
    const entry = await this.repository.create(userId, normalizedData);
    return this.enrichEntry(entry, food);
  }

  async findAllByDate(userId: string, date: Date): Promise<LogEntry[]> {
    const entries = await this.repository.findAllByUserIdAndDate(
      userId,
      startOfDayUtc(date),
    );
    return Promise.all(entries.map((entry) => this.enrichEntry(entry)));
  }

  async findOne(userId: string, id: string): Promise<LogEntry | null> {
    const entry = await this.repository.findOne(userId, id);
    if (!entry) return null;
    return this.enrichEntry(entry);
  }

  async update(
    userId: string,
    id: string,
    data: UpdateLogEntryData,
  ): Promise<LogEntry> {
    const existing = await this.repository.findOne(userId, id);
    if (!existing) {
      throw new LogEntryNotFoundError(id);
    }
    const normalizedData: UpdateLogEntryData = {
      ...data,
      loggedAt: data.loggedAt ? new Date(data.loggedAt) : undefined,
    };
    const updated = await this.repository.update(userId, id, normalizedData);
    return this.enrichEntry(updated);
  }

  async remove(userId: string, id: string): Promise<void> {
    const existing = await this.repository.findOne(userId, id);
    if (!existing) {
      throw new LogEntryNotFoundError(id);
    }
    await this.repository.remove(userId, id);
  }

  async getDailyDashboard(
    userId: string,
    date: Date,
  ): Promise<DailyDashboard> {
    const entries = await this.findAllByDate(userId, date);
    const totals = entries.reduce(
      (sum, entry) => addNutrients(sum, entry.nutrients),
      zeroNutrients(),
    );

    const activePlan = await this.onboardingService.getActivePlan(userId);
    const targets = activePlan?.targetNutrients ?? null;
    const remaining = targets ? subtractNutrients(targets, totals) : null;

    const mealSlots: MealSlotSummary[] = MEAL_SLOTS.map((mealSlot) => ({
      mealSlot,
      nutrients: entries
        .filter((entry) => entry.mealSlot === mealSlot)
        .reduce((sum, entry) => addNutrients(sum, entry.nutrients), zeroNutrients()),
    }));

    return {
      date: startOfDayUtc(date).toISOString(),
      totals,
      targets,
      remaining,
      mealSlots,
    };
  }

  private async enrichEntry(
    entry: LogEntry,
    knownFood?: Awaited<ReturnType<FoodService['findOne']>>,
  ): Promise<LogEntry> {
    const food =
      knownFood ?? (await this.foodService.findOne(entry.userId, entry.foodId));
    if (!food) {
      throw new FoodNotFoundError(entry.foodId);
    }
    const nutrients = scaleNutrients(food.nutrientsPer100g, entry.grams);
    return {
      ...entry,
      foodName: food.name,
      nutrients,
    };
  }

  private async requireFood(userId: string, foodId: string) {
    const food = await this.foodService.findOne(userId, foodId);
    if (!food) {
      throw new FoodNotFoundError(foodId);
    }
    return food;
  }
}
