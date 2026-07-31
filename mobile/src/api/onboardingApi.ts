import { apiClient } from './client';
import type {
  CreateProfileData,
  Plan,
  PlanOptionsResult,
  PlanRate,
  Profile,
} from '../types/onboarding';

const ONBOARDING_PATH = '/onboarding';

export const onboardingApi = {
  getProfile: () => apiClient.get<Profile>(`${ONBOARDING_PATH}/profile`),

  createProfile: (data: CreateProfileData) =>
    apiClient.post<Profile>(`${ONBOARDING_PATH}/profile`, data),

  getPlanOptions: () =>
    apiClient.post<PlanOptionsResult>(`${ONBOARDING_PATH}/plan-options`, {}),

  activatePlan: (rate: PlanRate) =>
    apiClient.post<Plan>(`${ONBOARDING_PATH}/activate-plan`, { rate }),

  getActivePlan: () =>
    apiClient.get<Plan | null>(`${ONBOARDING_PATH}/active-plan`),
};
