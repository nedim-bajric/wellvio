import { Nutrients } from './food';

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
  loggedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLogEntryData {
  foodId: string;
  grams: number;
  mealSlot: MealSlot;
  loggedAt?: string;
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
