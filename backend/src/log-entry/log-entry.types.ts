import { Nutrients } from '../diet/diet.types.js';

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export const MEAL_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snacks'];

export interface LogEntry {
  id: string;
  userId: string;
  foodId: string;
  foodName: string;
  grams: number;
  nutrients: Nutrients;
  mealSlot: MealSlot;
  loggedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLogEntryData {
  foodId: string;
  grams: number;
  mealSlot: MealSlot;
  loggedAt?: Date | string;
}

export type UpdateLogEntryData = Partial<CreateLogEntryData>;

export interface MealSlotSummary {
  mealSlot: MealSlot;
  nutrients: Nutrients;
}

export interface DailyDashboard {
  date: string;
  totals: Nutrients;
  targets: Nutrients | null;
  remaining: Nutrients | null;
  mealSlots: MealSlotSummary[];
}
