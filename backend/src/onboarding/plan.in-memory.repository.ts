import { Injectable } from '@nestjs/common';
import { PlanRepository } from './plan.repository.js';
import { CreatePlanData, Plan } from './onboarding.types.js';

@Injectable()
export class InMemoryPlanRepository implements PlanRepository {
  private readonly plans = new Map<string, Plan>();

  async create(data: CreatePlanData): Promise<Plan> {
    const now = new Date();
    const plan: Plan = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.plans.set(plan.id, plan);
    return plan;
  }

  async findActiveByUserId(userId: string): Promise<Plan | null> {
    return (
      Array.from(this.plans.values()).find(
        (plan) => plan.userId === userId && plan.active,
      ) ?? null
    );
  }

  async deactivateAll(userId: string): Promise<void> {
    for (const plan of this.plans.values()) {
      if (plan.userId === userId && plan.active) {
        plan.active = false;
        plan.updatedAt = new Date();
      }
    }
  }
}
