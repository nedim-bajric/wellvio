import { Inject, Injectable } from '@nestjs/common';
import { OnboardingService } from '../onboarding/onboarding.service.js';
import { KCAL_PER_KG_FAT } from '../diet/diet.calculations.js';
import { startOfDayUtc } from '../common/date.util.js';
import { WEIGHT_LOG_REPOSITORY } from './weight-log.repository.js';
import type { WeightLogRepository } from './weight-log.repository.js';
import { WeightLogNotFoundError } from './weight-log-not-found.error.js';
import { ActivePlanRequiredError } from './weight-log-domain.error.js';
import {
  CreateWeightLogData,
  PlanAdjustmentSuggestion,
  SuggestedPlan,
  UpdateWeightLogData,
  WeightLog,
  WeightTrendAnalysis,
} from './weight-log.types.js';
import { Plan, PlanOption } from '../onboarding/onboarding.types.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const TREND_TOLERANCE_KG_PER_WEEK = 0.1;

function daysBetween(start: Date, end: Date): number {
  const diff = startOfDayUtc(end).getTime() - startOfDayUtc(start).getTime();
  return Math.max(1, Math.round(diff / MS_PER_DAY));
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

@Injectable()
export class WeightLogService {
  constructor(
    @Inject(WEIGHT_LOG_REPOSITORY)
    private readonly repository: WeightLogRepository,
    private readonly onboardingService: OnboardingService,
  ) {}

  async create(userId: string, data: CreateWeightLogData): Promise<WeightLog> {
    const normalizedData: CreateWeightLogData = {
      ...data,
      loggedAt: data.loggedAt ? new Date(data.loggedAt) : new Date(),
    };
    return this.repository.create(userId, normalizedData);
  }

  async findAll(userId: string): Promise<WeightLog[]> {
    return this.repository.findAllByUserId(userId);
  }

  async findOne(userId: string, id: string): Promise<WeightLog | null> {
    return this.repository.findOne(userId, id);
  }

  async update(
    userId: string,
    id: string,
    data: UpdateWeightLogData,
  ): Promise<WeightLog> {
    const existing = await this.repository.findOne(userId, id);
    if (!existing) {
      throw new WeightLogNotFoundError(id);
    }
    const normalizedData: UpdateWeightLogData = {
      ...data,
      loggedAt: data.loggedAt ? new Date(data.loggedAt) : undefined,
    };
    return this.repository.update(userId, id, normalizedData);
  }

  async remove(userId: string, id: string): Promise<void> {
    const existing = await this.repository.findOne(userId, id);
    if (!existing) {
      throw new WeightLogNotFoundError(id);
    }
    await this.repository.remove(userId, id);
  }

  async analyzeTrend(userId: string): Promise<WeightTrendAnalysis> {
    const entries = await this.sortedEntries(userId);
    const activePlan = await this.onboardingService.getActivePlan(userId);

    if (entries.length < 2 || !activePlan) {
      return {
        latestWeightKg: entries[0]?.weightKg ?? 0,
        earliestWeightKg: entries[0]?.weightKg ?? 0,
        daysTracked: entries.length,
        actualDailyChangeKg: 0,
        actualWeeklyChangeKg: 0,
        plannedWeeklyChangeKg: this.plannedWeeklyChange(activePlan),
        trend: 'insufficientData',
      };
    }

    const earliest = entries[0];
    const latest = entries[entries.length - 1];
    const daysTracked = daysBetween(earliest.loggedAt, latest.loggedAt);
    const actualDailyChangeKg =
      (latest.weightKg - earliest.weightKg) / daysTracked;
    const actualWeeklyChangeKg = roundToOneDecimal(actualDailyChangeKg * 7);
    const plannedWeeklyChangeKg = this.plannedWeeklyChange(activePlan);

    const diff = actualWeeklyChangeKg - plannedWeeklyChangeKg;
    let trend: WeightTrendAnalysis['trend'] = 'onTrack';
    if (diff < -TREND_TOLERANCE_KG_PER_WEEK) {
      trend = 'ahead';
    } else if (diff > TREND_TOLERANCE_KG_PER_WEEK) {
      trend = 'behind';
    }

    return {
      latestWeightKg: latest.weightKg,
      earliestWeightKg: earliest.weightKg,
      daysTracked,
      actualDailyChangeKg: roundToOneDecimal(actualDailyChangeKg),
      actualWeeklyChangeKg,
      plannedWeeklyChangeKg,
      trend,
    };
  }

  async suggestAdjustment(userId: string): Promise<PlanAdjustmentSuggestion> {
    const trendAnalysis = await this.analyzeTrend(userId);
    const activePlan = await this.requireActivePlan(userId);

    const currentPlan: SuggestedPlan = {
      rate: activePlan.rate,
      targetCalories: activePlan.targetCalories,
      targetNutrients: activePlan.targetNutrients,
    };

    if (trendAnalysis.trend === 'insufficientData') {
      return {
        currentPlan,
        suggestedPlan: null,
        reason:
          'Log weight at least twice, a few days apart, to get an adjustment suggestion.',
        requiresApproval: true,
      };
    }

    if (trendAnalysis.trend === 'onTrack') {
      return {
        currentPlan,
        suggestedPlan: null,
        reason: 'You are on track with your plan. No adjustment needed.',
        requiresApproval: true,
      };
    }

    const { options } = await this.onboardingService.getPlanOptionsAtWeight(
      userId,
      trendAnalysis.latestWeightKg,
    );

    const suggestedRate = this.pickSuggestedRate(
      activePlan.rate,
      trendAnalysis.trend,
      options,
    );

    if (!suggestedRate) {
      return {
        currentPlan,
        suggestedPlan: null,
        reason:
          'No safe adjustment is available at your current weight. Consider updating your target date.',
        requiresApproval: true,
      };
    }

    const suggestedOption = options.find((o) => o.rate === suggestedRate);
    if (!suggestedOption) {
      return {
        currentPlan,
        suggestedPlan: null,
        reason:
          'No safe adjustment is available at your current weight. Consider updating your target date.',
        requiresApproval: true,
      };
    }

    const reason =
      trendAnalysis.trend === 'behind'
        ? `You're losing weight slower than planned (${trendAnalysis.actualWeeklyChangeKg} kg/week vs ${trendAnalysis.plannedWeeklyChangeKg} kg/week). A more aggressive plan is suggested.`
        : `You're losing weight faster than planned (${trendAnalysis.actualWeeklyChangeKg} kg/week vs ${trendAnalysis.plannedWeeklyChangeKg} kg/week). A milder plan is suggested.`;

    return {
      currentPlan,
      suggestedPlan: {
        rate: suggestedOption.rate,
        targetCalories: suggestedOption.targetCalories,
        targetNutrients: suggestedOption.targetNutrients,
      },
      reason,
      requiresApproval: true,
    };
  }

  async applyAdjustment(
    userId: string,
    rate: PlanOption['rate'],
  ): Promise<Plan> {
    const trendAnalysis = await this.analyzeTrend(userId);
    if (trendAnalysis.trend === 'insufficientData') {
      throw new ActivePlanRequiredError();
    }

    await this.requireActivePlan(userId);
    await this.onboardingService.updateCurrentWeight(
      userId,
      trendAnalysis.latestWeightKg,
    );
    return this.onboardingService.activatePlan(userId, rate);
  }

  private async sortedEntries(userId: string): Promise<WeightLog[]> {
    const entries = await this.repository.findAllByUserId(userId);
    return [...entries].sort(
      (a, b) => a.loggedAt.getTime() - b.loggedAt.getTime(),
    );
  }

  private plannedWeeklyChange(activePlan: Plan | null): number {
    if (!activePlan) return 0;
    return roundToOneDecimal((-activePlan.dailyDeficit * 7) / KCAL_PER_KG_FAT);
  }

  private async requireActivePlan(userId: string): Promise<Plan> {
    const activePlan = await this.onboardingService.getActivePlan(userId);
    if (!activePlan) {
      throw new ActivePlanRequiredError();
    }
    return activePlan;
  }

  private pickSuggestedRate(
    currentRate: PlanOption['rate'],
    trend: 'ahead' | 'behind' | 'onTrack' | 'insufficientData',
    options: PlanOption[],
  ): PlanOption['rate'] | null {
    if (trend !== 'ahead' && trend !== 'behind') return null;

    const rateOrder: PlanOption['rate'][] = ['mild', 'moderate', 'aggressive'];
    const currentIndex = rateOrder.indexOf(currentRate);
    const direction = trend === 'behind' ? 1 : -1;
    let targetIndex = currentIndex + direction;
    targetIndex = Math.max(0, Math.min(rateOrder.length - 1, targetIndex));

    for (let offset = 0; offset < rateOrder.length; offset++) {
      const higher = targetIndex + offset;
      if (
        higher < rateOrder.length &&
        options.some((o) => o.rate === rateOrder[higher])
      ) {
        return rateOrder[higher];
      }
      const lower = targetIndex - offset;
      if (lower >= 0 && options.some((o) => o.rate === rateOrder[lower])) {
        return rateOrder[lower];
      }
    }

    return null;
  }
}
