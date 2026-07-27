import {
  ActivityLevel,
  Gender,
  Nutrients,
  PlanRate,
} from '../diet/diet.types.js';

export type { PlanRate };

export interface Profile {
  id: string;
  userId: string;
  gender: Gender;
  age: number;
  heightCm: number;
  currentWeightKg: number;
  goalWeightKg: number;
  activityLevel: ActivityLevel;
  targetDate: Date;
  healthDisclaimerAcknowledged: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateProfileData = Omit<
  Profile,
  'id' | 'userId' | 'createdAt' | 'updatedAt'
>;

export type UpdateProfileData = Partial<CreateProfileData>;

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
  createdAt: Date;
  updatedAt: Date;
}

export type CreatePlanData = Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>;

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
