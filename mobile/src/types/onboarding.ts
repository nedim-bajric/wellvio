import type { Nutrients } from './food';

export type Gender = 'male' | 'female';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'veryActive';

export type PlanRate = 'mild' | 'moderate' | 'aggressive';

export interface Profile {
  id: string;
  userId: string;
  gender: Gender;
  age: number;
  heightCm: number;
  currentWeightKg: number;
  goalWeightKg: number;
  activityLevel: ActivityLevel;
  targetDate: string;
  healthDisclaimerAcknowledged: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfileData {
  gender: Gender;
  age: number;
  heightCm: number;
  currentWeightKg: number;
  goalWeightKg: number;
  activityLevel: ActivityLevel;
  targetDate: string;
  healthDisclaimerAcknowledged: boolean;
}

export interface PlanOption {
  rate: PlanRate;
  targetCalories: number;
  targetNutrients: Nutrients;
  dailyDeficit: number;
  daysToTarget: number;
  safe: boolean;
}

export interface PlanOptionsResult {
  options: PlanOption[];
}

export interface Plan {
  id: string;
  userId: string;
  profileId: string;
  targetCalories: number;
  targetNutrients: Nutrients;
  dailyDeficit: number;
  daysToTarget: number;
  rate: PlanRate;
  safe: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
