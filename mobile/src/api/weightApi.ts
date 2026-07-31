import { apiClient } from './client';
import type {
  CreateWeightLogData,
  Plan,
  PlanAdjustmentSuggestion,
  WeightLog,
  WeightTrendAnalysis,
} from '../types/weight';

const WEIGHT_LOGS_PATH = '/weight-logs';

export const weightApi = {
  list: () => apiClient.get<WeightLog[]>(WEIGHT_LOGS_PATH),
  create: (data: CreateWeightLogData) =>
    apiClient.post<WeightLog>(WEIGHT_LOGS_PATH, data),
  getTrend: () =>
    apiClient.get<WeightTrendAnalysis>(`${WEIGHT_LOGS_PATH}/trend`),
  getAdjustmentSuggestion: () =>
    apiClient.get<PlanAdjustmentSuggestion>(
      `${WEIGHT_LOGS_PATH}/adjustment-suggestion`,
    ),
  applyAdjustment: (rate: NonNullable<PlanAdjustmentSuggestion['suggestedPlan']>['rate']) =>
    apiClient.post<Plan>(`${WEIGHT_LOGS_PATH}/apply-adjustment`, { rate }),
};
