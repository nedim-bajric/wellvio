import {
  ActivityLevel,
  FeasibilityResult,
  Gender,
  Nutrients,
  Plan,
  PlanRate,
  UserProfile,
} from './diet.types.js';

export const KCAL_PER_KG_FAT = 7700;

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

const SAFETY_FLOORS: Record<Gender, number> = {
  female: 1200,
  male: 1500,
};

const PROTEIN_RATIO = 0.3;
const FAT_RATIO = 0.3;
const CARB_RATIO = 0.4;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

interface DeficitInputs {
  tdee: number;
  weightDeltaKg: number;
  daysToTarget: number;
  rawDeficit: number;
  floor: number;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function today(): Date {
  return startOfDay(new Date());
}

export function calculateBMR(profile: UserProfile): number {
  const { gender, age, heightCm, currentWeightKg } = profile;
  const base = 10 * currentWeightKg + 6.25 * heightCm - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}

export function calculateTDEE(profile: UserProfile): number {
  return calculateBMR(profile) * ACTIVITY_MULTIPLIERS[profile.activityLevel];
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round(
    (startOfDay(to).getTime() - startOfDay(from).getTime()) / MS_PER_DAY,
  );
}

function getDeficitInputs(profile: UserProfile): DeficitInputs {
  const tdee = calculateTDEE(profile);
  const weightDeltaKg = profile.currentWeightKg - profile.goalWeightKg;
  const daysToTarget = Math.max(1, daysBetween(today(), profile.targetDate));
  const rawDeficit = (weightDeltaKg * KCAL_PER_KG_FAT) / daysToTarget;
  const floor = SAFETY_FLOORS[profile.gender];
  return { tdee, weightDeltaKg, daysToTarget, rawDeficit, floor };
}

function classifyRate(deficit: number, tdee: number): PlanRate {
  const ratio = tdee > 0 ? deficit / tdee : 0;
  if (ratio < 0.15) {
    return 'mild';
  }
  if (ratio <= 0.25) {
    return 'moderate';
  }
  return 'aggressive';
}

export function calculateMacroTargets(targetCalories: number): Nutrients {
  return {
    calories: targetCalories,
    protein: roundToOneDecimal((targetCalories * PROTEIN_RATIO) / 4),
    fat: roundToOneDecimal((targetCalories * FAT_RATIO) / 9),
    carbs: roundToOneDecimal((targetCalories * CARB_RATIO) / 4),
  };
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

export function generatePlan(profile: UserProfile): Plan {
  const { tdee, weightDeltaKg, daysToTarget, rawDeficit, floor } =
    getDeficitInputs(profile);

  let targetCalories = tdee - rawDeficit;
  let safe = true;

  if (weightDeltaKg > 0 && targetCalories < floor) {
    targetCalories = floor;
    safe = false;
  }

  const dailyDeficit = tdee - targetCalories;

  return {
    targetCalories: Math.round(targetCalories),
    targetNutrients: calculateMacroTargets(targetCalories),
    dailyDeficit: roundToOneDecimal(dailyDeficit),
    daysToTarget,
    rate: classifyRate(dailyDeficit, tdee),
    safe,
  };
}

export function checkFeasibility(profile: UserProfile): FeasibilityResult {
  const {
    tdee,
    weightDeltaKg,
    rawDeficit: requiredDailyDeficit,
    floor,
  } = getDeficitInputs(profile);

  // Weight gain / maintenance is not constrained by the under-eating floor.
  if (weightDeltaKg <= 0) {
    return {
      feasible: true,
      requiredDailyDeficit: roundToOneDecimal(requiredDailyDeficit),
      minimumSafeDays: 0,
      message: 'Target does not require a caloric deficit.',
    };
  }

  const targetCalories = tdee - requiredDailyDeficit;
  const feasible = targetCalories >= floor;

  if (feasible) {
    return {
      feasible: true,
      requiredDailyDeficit: roundToOneDecimal(requiredDailyDeficit),
      minimumSafeDays: 0,
      message: 'Target is achievable within safe calorie limits.',
    };
  }

  const maxDeficit = tdee - floor;
  if (maxDeficit <= 0) {
    return {
      feasible: false,
      requiredDailyDeficit: roundToOneDecimal(requiredDailyDeficit),
      minimumSafeDays: Infinity,
      message:
        `Target cannot be achieved safely: TDEE is already at or below ` +
        `the safe minimum of ${floor} kcal/day.`,
    };
  }

  const minimumSafeDays = Math.ceil(
    (weightDeltaKg * KCAL_PER_KG_FAT) / maxDeficit,
  );

  return {
    feasible: false,
    requiredDailyDeficit: roundToOneDecimal(requiredDailyDeficit),
    minimumSafeDays,
    message:
      `Target requires ${Math.round(requiredDailyDeficit)} kcal/day deficit, ` +
      `which exceeds the safe minimum of ${floor} kcal/day. ` +
      `Extend the target date to at least ${minimumSafeDays} days.`,
  };
}

export function scaleNutrients(per100g: Nutrients, grams: number): Nutrients {
  const factor = grams / 100;
  return {
    calories: roundToOneDecimal(per100g.calories * factor),
    protein: roundToOneDecimal(per100g.protein * factor),
    carbs: roundToOneDecimal(per100g.carbs * factor),
    fat: roundToOneDecimal(per100g.fat * factor),
  };
}

const PLAN_DEFICIT_RATIOS: { rate: PlanRate; ratio: number }[] = [
  { rate: 'mild', ratio: 0.15 },
  { rate: 'moderate', ratio: 0.2 },
  { rate: 'aggressive', ratio: 0.25 },
];

export function generatePlanOptions(profile: UserProfile): Plan[] {
  const tdee = calculateTDEE(profile);
  const floor = SAFETY_FLOORS[profile.gender];
  const weightDeltaKg = profile.currentWeightKg - profile.goalWeightKg;

  return PLAN_DEFICIT_RATIOS.map(({ rate, ratio }) => {
    let targetCalories = tdee * (1 - ratio);
    let safe = true;

    // The safety floor only applies to weight-loss plans; weight-gain or
    // maintenance targets are not constrained by the under-eating floor.
    if (weightDeltaKg > 0 && targetCalories < floor) {
      targetCalories = floor;
      safe = false;
    }

    const dailyDeficit = tdee - targetCalories;
    const daysToTarget =
      weightDeltaKg > 0 && dailyDeficit > 0
        ? Math.ceil((weightDeltaKg * KCAL_PER_KG_FAT) / dailyDeficit)
        : 0;

    return {
      targetCalories: Math.round(targetCalories),
      targetNutrients: calculateMacroTargets(targetCalories),
      dailyDeficit: roundToOneDecimal(dailyDeficit),
      daysToTarget,
      rate,
      safe,
    };
  }).filter((plan) => plan.safe);
}
