import { Nutrients } from './food';

export type WeightTrend =
  | 'ahead'
  | 'onTrack'
  | 'behind'
  | 'insufficientData';

export interface WeightLog {
  id: string;
  userId: string;
  weightKg: number;
  loggedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWeightLogData {
  weightKg: number;
  loggedAt?: string;
}

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
  rate: 'mild' | 'moderate' | 'aggressive';
  targetCalories: number;
  targetNutrients: Nutrients;
}

export interface PlanAdjustmentSuggestion {
  currentPlan: SuggestedPlan;
  suggestedPlan: SuggestedPlan | null;
  reason: string;
  requiresApproval: true;
}

export interface Plan {
  id: string;
  userId: string;
  profileId: string;
  targetCalories: number;
  targetNutrients: Nutrients;
  dailyDeficit: number;
  daysToTarget: number;
  rate: 'mild' | 'moderate' | 'aggressive';
  safe: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
