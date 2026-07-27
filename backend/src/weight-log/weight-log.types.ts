import { Nutrients, PlanRate } from '../diet/diet.types.js';

export interface WeightLog {
  id: string;
  userId: string;
  weightKg: number;
  loggedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWeightLogData {
  weightKg: number;
  loggedAt?: Date | string;
}

export type UpdateWeightLogData = Partial<CreateWeightLogData>;

export type WeightTrend = 'ahead' | 'onTrack' | 'behind' | 'insufficientData';

export interface WeightTrendAnalysis {
  latestWeightKg: number;
  earliestWeightKg: number;
  daysTracked: number;
  actualDailyChangeKg: number;
  actualWeeklyChangeKg: number;
  plannedWeeklyChangeKg: number;
  trend: WeightTrend;
}

export interface SuggestedPlan {
  rate: PlanRate;
  targetCalories: number;
  targetNutrients: Nutrients;
}

export interface PlanAdjustmentSuggestion {
  currentPlan: SuggestedPlan;
  suggestedPlan: SuggestedPlan | null;
  reason: string;
  requiresApproval: true;
}
