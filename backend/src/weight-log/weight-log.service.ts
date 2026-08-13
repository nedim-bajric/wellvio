import { Inject, Injectable } from '@nestjs/common';
import { OnboardingService } from '../onboarding/onboarding.service.js';
import {
  KCAL_PER_KG_FAT,
  roundToOneDecimal,
} from '../diet/diet.calculations.js';
import { startOfDayUtc } from '../common/date.util.js';
import { WEIGHT_LOG_REPOSITORY } from './weight-log.repository.js';
import type { WeightLogRepository } from './weight-log.repository.js';
import { WeightLogNotFoundError } from './weight-log-not-found.error.js';
import {
  ActivePlanRequiredError,
  AdjustmentRateMismatchError,
  InsufficientDataForAdjustmentError,
} from './weight-log-domain.error.js';
import {
  CreateWeightLogData,
  PlanAdjustmentSuggestion,
  SuggestedPlan,
  UpdateWeightLogData,
  WeightLog,
  WeightTrend,
  WeightTrendAnalysis,
} from './weight-log.types.js';
import { Plan, PlanOption } from '../onboarding/onboarding.types.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const TREND_TOLERANCE_KG_PER_WEEK = 0.1;

function daysBetweenUtc(start: Date, end: Date): number {
  const diff = startOfDayUtc(end).getTime() - startOfDayUtc(start).getTime();
  return Math.max(1, Math.round(diff / MS_PER_DAY));
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

  async removeAllByUserId(userId: string): Promise<void> {
    await this.repository.removeAllByUserId(userId);
  }

  async analyzeTrend(userId: string): Promise<WeightTrendAnalysis> {
    const entries = await this.chronologicalEntries(userId);
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
    const daysTracked = daysBetweenUtc(earliest.loggedAt, latest.loggedAt);
    const actualDailyChangeKg =
      (latest.weightKg - earliest.weightKg) / daysTracked;
    const actualWeeklyChangeKg = roundToOneDecimal(actualDailyChangeKg * 7);
    const plannedWeeklyChangeKg = this.plannedWeeklyChange(activePlan);

    const trend = this.classifyTrend(
      actualWeeklyChangeKg,
      plannedWeeklyChangeKg,
    );

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

  async suggestAdjustment(
    userId: string,
  ): Promise<PlanAdjustmentSuggestion> {
    const { entries, activePlan, trend } = await this.analyzeTrendWithPlan(
      userId,
    );

    const currentPlan: SuggestedPlan = {
      rate: activePlan.rate,
      targetCalories: activePlan.targetCalories,
      targetNutrients: activePlan.targetNutrients,
    };

    if (entries.length < 2 || trend === 'insufficientData') {
      return {
        currentPlan,
        suggestedPlan: null,
        reason:
          'Log weight at least twice, a few days apart, to get an adjustment suggestion.',
        requiresApproval: true,
      };
    }

    if (trend === 'onTrack') {
      return {
        currentPlan,
        suggestedPlan: null,
        reason: 'You are on track with your plan. No adjustment needed.',
        requiresApproval: true,
      };
    }

    const { options } = await this.onboardingService.getPlanOptionsAtWeight(
      userId,
      entries[entries.length - 1].weightKg,
    );

    const suggestedOption = this.pickSuggestedOption(
      activePlan.rate,
      trend,
      options,
    );

    if (!suggestedOption) {
      return {
        currentPlan,
        suggestedPlan: null,
        reason:
          'No safe adjustment is available at your current weight. Consider updating your target date.',
        requiresApproval: true,
      };
    }

    const reason = this.buildSuggestionReason(
      trend,
      entries[entries.length - 1].weightKg,
      entries[0].weightKg,
      daysBetweenUtc(entries[0].loggedAt, entries[entries.length - 1].loggedAt),
      suggestedOption,
    );

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
    const { entries, trend } = await this.analyzeTrendWithPlan(userId);

    if (entries.length < 2 || trend === 'insufficientData') {
      throw new InsufficientDataForAdjustmentError();
    }

    const latestWeight = entries[entries.length - 1].weightKg;
    const suggestion = await this.suggestAdjustment(userId);

    if (!suggestion.suggestedPlan || suggestion.suggestedPlan.rate !== rate) {
      throw new AdjustmentRateMismatchError(rate);
    }

    await this.onboardingService.updateCurrentWeight(userId, latestWeight);
    return this.onboardingService.activatePlan(userId, rate);
  }

  private async chronologicalEntries(userId: string): Promise<WeightLog[]> {
    const entries = await this.repository.findAllByUserId(userId);
    return [...entries].sort(
      (a, b) => a.loggedAt.getTime() - b.loggedAt.getTime(),
    );
  }

  private async analyzeTrendWithPlan(userId: string): Promise<{
    entries: WeightLog[];
    activePlan: Plan;
    trend: WeightTrend;
  }> {
    const entries = await this.chronologicalEntries(userId);
    const activePlan = await this.onboardingService.getActivePlan(userId);
    if (!activePlan) {
      throw new ActivePlanRequiredError();
    }

    if (entries.length < 2) {
      return { entries, activePlan, trend: 'insufficientData' };
    }

    const earliest = entries[0];
    const latest = entries[entries.length - 1];
    const daysTracked = daysBetweenUtc(earliest.loggedAt, latest.loggedAt);
    const actualDailyChangeKg =
      (latest.weightKg - earliest.weightKg) / daysTracked;
    const actualWeeklyChangeKg = roundToOneDecimal(actualDailyChangeKg * 7);
    const plannedWeeklyChangeKg = this.plannedWeeklyChange(activePlan);

    return {
      entries,
      activePlan,
      trend: this.classifyTrend(actualWeeklyChangeKg, plannedWeeklyChangeKg),
    };
  }

  private classifyTrend(
    actualWeeklyChangeKg: number,
    plannedWeeklyChangeKg: number,
  ): WeightTrend {
    const diff = actualWeeklyChangeKg - plannedWeeklyChangeKg;
    if (diff < -TREND_TOLERANCE_KG_PER_WEEK) {
      return 'ahead';
    }
    if (diff > TREND_TOLERANCE_KG_PER_WEEK) {
      return 'behind';
    }
    return 'onTrack';
  }

  private plannedWeeklyChange(activePlan: Plan | null): number {
    if (!activePlan) return 0;
    return roundToOneDecimal(
      (-activePlan.dailyDeficit * 7) / KCAL_PER_KG_FAT,
    );
  }

  private pickSuggestedOption(
    currentRate: PlanOption['rate'],
    trend: Exclude<WeightTrend, 'insufficientData' | 'onTrack'>,
    options: PlanOption[],
  ): PlanOption | null {
    const safeOptions = options.filter((o) => o.safe);
    const rateOrder: PlanOption['rate'][] = ['mild', 'moderate', 'aggressive'];
    const currentIndex = rateOrder.indexOf(currentRate);
    const direction = trend === 'behind' ? 1 : -1;
    const targetIndex = Math.max(
      0,
      Math.min(rateOrder.length - 1, currentIndex + direction),
    );

    for (let offset = 0; offset < rateOrder.length; offset++) {
      const higherIndex = targetIndex + offset;
      if (
        higherIndex < rateOrder.length &&
        safeOptions.some((o) => o.rate === rateOrder[higherIndex])
      ) {
        return (
          safeOptions.find((o) => o.rate === rateOrder[higherIndex]) ?? null
        );
      }
      const lowerIndex = targetIndex - offset;
      if (
        lowerIndex >= 0 &&
        safeOptions.some((o) => o.rate === rateOrder[lowerIndex])
      ) {
        return (
          safeOptions.find((o) => o.rate === rateOrder[lowerIndex]) ?? null
        );
      }
    }

    return null;
  }

  private buildSuggestionReason(
    trend: Exclude<WeightTrend, 'insufficientData' | 'onTrack'>,
    latestWeightKg: number,
    earliestWeightKg: number,
    daysTracked: number,
    suggestedOption: PlanOption,
  ): string {
    const totalChangeKg = roundToOneDecimal(latestWeightKg - earliestWeightKg);
    const averageWeeklyChangeKg = roundToOneDecimal(
      (totalChangeKg / daysTracked) * 7,
    );

    if (trend === 'behind') {
      return `You're losing weight slower than planned (${averageWeeklyChangeKg} kg/week). A more aggressive ${suggestedOption.rate} plan (${suggestedOption.targetCalories} kcal/day) is suggested.`;
    }

    return `You're losing weight faster than planned (${averageWeeklyChangeKg} kg/week). A milder ${suggestedOption.rate} plan (${suggestedOption.targetCalories} kcal/day) is suggested.`;
  }
}
