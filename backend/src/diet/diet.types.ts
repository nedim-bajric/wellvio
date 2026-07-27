export type Gender = 'male' | 'female';

export type ActivityLevel =
  'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';

export type PlanRate = 'mild' | 'moderate' | 'aggressive';

export interface UserProfile {
  gender: Gender;
  age: number;
  heightCm: number;
  currentWeightKg: number;
  goalWeightKg: number;
  activityLevel: ActivityLevel;
  targetDate: Date;
}

export interface Nutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Plan {
  targetCalories: number;
  targetNutrients: Nutrients;
  dailyDeficit: number;
  daysToTarget: number;
  rate: PlanRate;
  safe: boolean;
}

export interface FeasibilityResult {
  feasible: boolean;
  requiredDailyDeficit: number;
  minimumSafeDays: number;
  message: string;
}
