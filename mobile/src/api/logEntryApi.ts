import { supabase } from '../lib/supabase';
import { scaleNutrients, roundToOneDecimal } from '../utils/diet';
import type { Nutrients } from '../types/food';
import type {
  CreateLogEntryData,
  DailyDashboard,
  LogEntry,
  MealSlot,
  MealSlotSummary,
  UpdateLogEntryData,
} from '../types/logEntry';
import type { Plan } from '../types/weight';

interface LogEntryRow {
  id: string;
  user_id: string;
  food_id: string | null;
  food_name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_slot: MealSlot;
  logged_at: string;
  created_at: string;
  updated_at: string;
}

const SLOT_BUDGET_RATIOS: Record<MealSlot, number> = {
  breakfast: 0.25,
  lunch: 0.35,
  dinner: 0.35,
  snacks: 0.05,
};

function emptyNutrients(): Nutrients {
  return { calories: 0, protein: 0, carbs: 0, fat: 0 };
}

function sumNutrients(a: Nutrients, b: Nutrients): Nutrients {
  return {
    calories: roundToOneDecimal(a.calories + b.calories),
    protein: roundToOneDecimal(a.protein + b.protein),
    carbs: roundToOneDecimal(a.carbs + b.carbs),
    fat: roundToOneDecimal(a.fat + b.fat),
  };
}

function toLogEntry(row: LogEntryRow): LogEntry {
  return {
    id: row.id,
    userId: row.user_id,
    foodId: row.food_id ?? '',
    foodName: row.food_name,
    grams: row.grams,
    nutrients: {
      calories: row.calories,
      protein: row.protein,
      carbs: row.carbs,
      fat: row.fat,
    },
    mealSlot: row.meal_slot,
    loggedAt: row.logged_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toCreateRow(
  data: CreateLogEntryData & { userId: string; foodName: string; nutrients: Nutrients },
): Omit<LogEntryRow, 'id' | 'created_at' | 'updated_at'> {
  return {
    user_id: data.userId,
    food_id: data.foodId || null,
    food_name: data.foodName,
    grams: data.grams,
    calories: data.nutrients.calories,
    protein: data.nutrients.protein,
    carbs: data.nutrients.carbs,
    fat: data.nutrients.fat,
    meal_slot: data.mealSlot,
    logged_at: data.loggedAt ?? new Date().toISOString(),
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

function dateKey(date: Date | string): string {
  return new Date(date).toISOString().slice(0, 10);
}

export function isToday(date: Date | string): boolean {
  return dateKey(date) === dateKey(new Date());
}

function dayBounds(dateKey: string): { start: string; end: string } {
  return {
    start: `${dateKey}T00:00:00Z`,
    end: `${dateKey}T23:59:59.999Z`,
  };
}

async function fetchActivePlan(userId: string): Promise<Plan | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('active_plan_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (!profile?.active_plan_id) {
    return null;
  }

  const { data: plan } = await supabase
    .from('plans')
    .select('*')
    .eq('id', profile.active_plan_id)
    .eq('user_id', userId)
    .maybeSingle();

  if (!plan) {
    return null;
  }

  return {
    id: plan.id,
    userId: plan.user_id,
    profileId: plan.profile_id,
    targetCalories: plan.target_calories,
    targetNutrients: {
      calories: plan.target_calories,
      protein: plan.target_protein,
      carbs: plan.target_carbs,
      fat: plan.target_fat,
    },
    dailyDeficit: plan.daily_deficit,
    daysToTarget: plan.days_to_target,
    rate: plan.rate,
    safe: plan.safe,
    active: plan.active,
    createdAt: plan.created_at,
    updatedAt: plan.updated_at,
  };
}

function buildDashboard(
  date: string,
  entries: LogEntry[],
  activePlan: Plan | null,
): DailyDashboard {
  const totals = entries.reduce<Nutrients>(
    (sum, entry) => sumNutrients(sum, entry.nutrients),
    emptyNutrients(),
  );

  const targets = activePlan
    ? {
        calories: activePlan.targetCalories,
        protein: activePlan.targetNutrients.protein,
        carbs: activePlan.targetNutrients.carbs,
        fat: activePlan.targetNutrients.fat,
      }
    : null;

  const remaining = targets
    ? {
        calories: roundToOneDecimal(targets.calories - totals.calories),
        protein: roundToOneDecimal(targets.protein - totals.protein),
        carbs: roundToOneDecimal(targets.carbs - totals.carbs),
        fat: roundToOneDecimal(targets.fat - totals.fat),
      }
    : null;

  const slotTotals: Record<MealSlot, Nutrients> = {
    breakfast: emptyNutrients(),
    lunch: emptyNutrients(),
    dinner: emptyNutrients(),
    snacks: emptyNutrients(),
  };
  for (const entry of entries) {
    slotTotals[entry.mealSlot] = sumNutrients(
      slotTotals[entry.mealSlot],
      entry.nutrients,
    );
  }

  const mealSlots: MealSlotSummary[] = Object.keys(slotTotals).map(
    (slot): MealSlotSummary => ({
      mealSlot: slot as MealSlot,
      nutrients: slotTotals[slot as MealSlot],
    }),
  );

  return {
    date,
    totals,
    targets,
    remaining,
    mealSlots,
  };
}

export const logEntryApi = {
  async list(date?: string): Promise<LogEntry[]> {
    const userId = await getCurrentUserId();
    const dateKey = date ?? new Date().toISOString().split('T')[0];
    const { start, end } = dayBounds(dateKey);

    const { data, error } = await supabase
      .from('log_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_at', start)
      .lte('logged_at', end)
      .order('logged_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data as LogEntryRow[] | null ?? []).map(toLogEntry);
  },

  async getDashboard(date?: string): Promise<DailyDashboard> {
    const userId = await getCurrentUserId();
    const dateKey = date ?? new Date().toISOString().split('T')[0];
    const { start, end } = dayBounds(dateKey);

    const [{ data, error }, activePlan] = await Promise.all([
      supabase
        .from('log_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('logged_at', start)
        .lte('logged_at', end),
      fetchActivePlan(userId),
    ]);

    if (error) {
      throw new Error(error.message);
    }

    const entries = (data as LogEntryRow[] | null ?? []).map(toLogEntry);
    return buildDashboard(dateKey, entries, activePlan);
  },

  async create(data: CreateLogEntryData): Promise<LogEntry> {
    const userId = await getCurrentUserId();

    let foodName: string;
    let nutrients: Nutrients;
    let foodId: string | undefined;

    if (data.nutrients) {
      // Quick-add: create a reusable catalog food from the portion data,
      // then link the log entry to it.
      const quickName = data.title?.trim() || 'Quick add';
      if (data.grams <= 0) {
        throw new Error('Grams must be greater than 0');
      }
      const factor = 100 / data.grams;
      const { data: foodRow, error: foodError } = await supabase
        .from('foods')
        .insert({
          user_id: userId,
          name: quickName,
          calories_per_100g: roundToOneDecimal(data.nutrients.calories * factor),
          protein_per_100g: roundToOneDecimal(data.nutrients.protein * factor),
          carbs_per_100g: roundToOneDecimal(data.nutrients.carbs * factor),
          fat_per_100g: roundToOneDecimal(data.nutrients.fat * factor),
        })
        .select()
        .single();

      if (foodError || !foodRow) {
        throw new Error(foodError?.message ?? 'Failed to create quick-add food');
      }

      foodName = quickName;
      foodId = foodRow.id;
      nutrients = data.nutrients;
    } else if (data.foodId) {
      const { data: food, error: foodError } = await supabase
        .from('foods')
        .select('*')
        .eq('id', data.foodId)
        .single();

      if (foodError || !food) {
        throw new Error(foodError?.message ?? 'Food not found');
      }

      foodName = food.name;
      foodId = data.foodId;
      nutrients = scaleNutrients(
        {
          calories: food.calories_per_100g,
          protein: food.protein_per_100g,
          carbs: food.carbs_per_100g,
          fat: food.fat_per_100g,
        },
        data.grams,
      );
    } else {
      // Legacy fallback: treat grams as calories.
      foodName = 'Quick add';
      nutrients = {
        calories: data.grams,
        protein: 0,
        carbs: 0,
        fat: 0,
      };
    }

    const { data: row, error } = await supabase
      .from('log_entries')
      .insert(
        toCreateRow({
          ...data,
          foodId,
          userId,
          foodName,
          nutrients,
        }),
      )
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return toLogEntry(row as LogEntryRow);
  },

  async update(id: string, data: UpdateLogEntryData): Promise<LogEntry> {
    const userId = await getCurrentUserId();

    const { data: existingRow, error: fetchError } = await supabase
      .from('log_entries')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingRow) {
      throw new Error(fetchError?.message ?? 'Log entry not found');
    }

    const existing = toLogEntry(existingRow as LogEntryRow);
    const isQuickAdd = !existing.foodId;
    const update: Partial<Omit<LogEntryRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>> = {};

    if (data.mealSlot !== undefined) {
      update.meal_slot = data.mealSlot;
    }
    if (data.loggedAt !== undefined) {
      update.logged_at = data.loggedAt;
    }

    if (isQuickAdd) {
      if (data.title !== undefined) {
        update.food_name = data.title.trim() || 'Quick add';
      }
      if (data.grams !== undefined) {
        update.grams = data.grams;
      }
      if (data.nutrients) {
        update.calories = data.nutrients.calories;
        update.protein = data.nutrients.protein;
        update.carbs = data.nutrients.carbs;
        update.fat = data.nutrients.fat;
      }
    } else if (data.grams !== undefined) {
      const foodId = data.foodId ?? existing.foodId;
      const { data: food, error: foodError } = await supabase
        .from('foods')
        .select('*')
        .eq('id', foodId)
        .single();

      if (foodError || !food) {
        throw new Error(foodError?.message ?? 'Food not found');
      }

      update.grams = data.grams;
      const scaled = scaleNutrients(
        {
          calories: food.calories_per_100g,
          protein: food.protein_per_100g,
          carbs: food.carbs_per_100g,
          fat: food.fat_per_100g,
        },
        data.grams,
      );
      update.calories = scaled.calories;
      update.protein = scaled.protein;
      update.carbs = scaled.carbs;
      update.fat = scaled.fat;
    }

    const { data: row, error } = await supabase
      .from('log_entries')
      .update(update)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return toLogEntry(row as LogEntryRow);
  },

  async remove(id: string): Promise<void> {
    const userId = await getCurrentUserId();

    const { data: existingRow, error: fetchError } = await supabase
      .from('log_entries')
      .select('logged_at')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingRow) {
      throw new Error(fetchError?.message ?? 'Log entry not found');
    }

    if (!isToday(existingRow.logged_at)) {
      throw new Error('You can only delete entries from today');
    }

    const { error } = await supabase
      .from('log_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }
  },
};
