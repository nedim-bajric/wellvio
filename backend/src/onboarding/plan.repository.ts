import { CreatePlanData, Plan } from './onboarding.types.js';

export const PLAN_REPOSITORY = Symbol('PLAN_REPOSITORY');

export interface PlanRepository {
  create(data: CreatePlanData): Promise<Plan>;
  findActiveByUserId(userId: string): Promise<Plan | null>;
  deactivateAll(userId: string): Promise<void>;
  removeAllByUserId(userId: string): Promise<void>;
}
