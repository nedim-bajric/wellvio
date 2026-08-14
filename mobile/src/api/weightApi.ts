import { supabase } from '../lib/supabase';
import { KCAL_PER_KG_FAT, roundToOneDecimal } from '../utils/diet';
import type {
  CreateWeightLogData,
  Plan,
  PlanAdjustmentSuggestion,
  WeightLog,
  WeightTrend,
  WeightTrendAnalysis,
} from '../types/weight';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const TREND_TOLERANCE_KG_PER_WEEK = 0.1;

interface WeightLogRow {
  id: string;
  user_id: string;
  weight_kg: number;
  logged_at: string;
  created_at: string;
  updated_at: string;
}

function mapRowToWeightLog(row: WeightLogRow): WeightLog {
  return {
    id: row.id,
    userId: row.user_id,
    weightKg: row.weight_kg,
    loggedAt: row.logged_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(error.message);
  }
  const userId = data.session?.user.id;
  if (!userId) {
    throw new Error('Not authenticated');
  }
  return userId;
}

function daysBetween(start: Date, end: Date): number {
  const diff = end.getTime() - start.getTime();
  return Math.max(1, Math.round(diff / MS_PER_DAY));
}

function plannedWeeklyChangeKg(dailyDeficit: number | null | undefined): number {
  if (dailyDeficit == null) return 0;
  return roundToOneDecimal((-dailyDeficit * 7) / KCAL_PER_KG_FAT);
}

function classifyTrend(
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

async function fetchActivePlanDailyDeficit(
  userId: string,
): Promise<number | null> {
  const { data, error } = await supabase
    .from('plans')
    .select('daily_deficit')
    .eq('user_id', userId)
    .eq('active', true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as { daily_deficit: number | null } | null)?.daily_deficit ?? null;
}

export const weightApi = {
  list: async (): Promise<WeightLog[]> => {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data as WeightLogRow[] | null ?? []).map(mapRowToWeightLog);
  },

  create: async (data: CreateWeightLogData): Promise<WeightLog> => {
    const userId = await getCurrentUserId();
    const loggedAt = data.loggedAt ?? new Date().toISOString();

    const { data: row, error } = await supabase
      .from('weight_logs')
      .insert({
        user_id: userId,
        weight_kg: data.weightKg,
        logged_at: loggedAt,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapRowToWeightLog(row as WeightLogRow);
  },

  getTrend: async (): Promise<WeightTrendAnalysis> => {
    const userId = await getCurrentUserId();
    const sevenDaysAgo = new Date(Date.now() - 7 * MS_PER_DAY).toISOString();

    const [{ data, error }, dailyDeficit] = await Promise.all([
      supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('logged_at', sevenDaysAgo)
        .order('logged_at', { ascending: true }),
      fetchActivePlanDailyDeficit(userId),
    ]);

    if (error) {
      throw new Error(error.message);
    }

    const entries = (data as WeightLogRow[] | null ?? []).map(mapRowToWeightLog);
    const planned = plannedWeeklyChangeKg(dailyDeficit);

    if (entries.length < 2) {
      const onlyEntry = entries[0];
      return {
        latestWeightKg: onlyEntry?.weightKg ?? 0,
        earliestWeightKg: onlyEntry?.weightKg ?? 0,
        daysTracked: entries.length,
        actualDailyChangeKg: 0,
        actualWeeklyChangeKg: 0,
        plannedWeeklyChangeKg: planned,
        trend: 'insufficientData',
      };
    }

    const earliest = entries[0];
    const latest = entries[entries.length - 1];
    const daysTracked = daysBetween(
      new Date(earliest.loggedAt),
      new Date(latest.loggedAt),
    );
    const actualDailyChangeKg =
      (latest.weightKg - earliest.weightKg) / daysTracked;
    const actualWeeklyChangeKg = roundToOneDecimal(actualDailyChangeKg * 7);

    return {
      latestWeightKg: latest.weightKg,
      earliestWeightKg: earliest.weightKg,
      daysTracked,
      actualDailyChangeKg: roundToOneDecimal(actualDailyChangeKg),
      actualWeeklyChangeKg,
      plannedWeeklyChangeKg: planned,
      trend: classifyTrend(actualWeeklyChangeKg, planned),
    };
  },

  getAdjustmentSuggestion: async (): Promise<PlanAdjustmentSuggestion> => ({
    currentPlan: {
      rate: 'mild',
      targetCalories: 0,
      targetNutrients: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      },
    },
    suggestedPlan: null,
    reason: 'No adjustment suggestion available.',
    requiresApproval: true as const,
  }),

  applyAdjustment: async (
    _rate: NonNullable<PlanAdjustmentSuggestion['suggestedPlan']>['rate'],
  ): Promise<Plan> => {
    throw new Error('Not implemented');
  },
};
