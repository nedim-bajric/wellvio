import {
  calculateBMR,
  calculateTDEE,
  generatePlan,
  generatePlanOptions,
  checkFeasibility,
  scaleNutrients,
  daysBetween,
} from './diet';
import type { UserProfile } from './diet';

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function profile(partial: Partial<UserProfile> = {}): UserProfile {
  return {
    gender: 'male',
    age: 30,
    heightCm: 180,
    currentWeightKg: 90,
    goalWeightKg: 85,
    activityLevel: 'sedentary',
    targetDate: daysFromNow(90),
    ...partial,
  };
}

describe('calculateBMR', () => {
  it('returns the correct BMR for a man using Mifflin-St Jeor', () => {
    const p = profile({
      gender: 'male',
      age: 30,
      heightCm: 180,
      currentWeightKg: 80,
    });
    expect(calculateBMR(p)).toBeCloseTo(1780, 0);
  });

  it('returns the correct BMR for a woman using Mifflin-St Jeor', () => {
    const p = profile({
      gender: 'female',
      age: 30,
      heightCm: 165,
      currentWeightKg: 65,
    });
    expect(calculateBMR(p)).toBeCloseTo(1370.25, 1);
  });
});

describe('calculateTDEE', () => {
  it('multiplies BMR by the sedentary activity factor', () => {
    const p = profile({
      gender: 'male',
      age: 30,
      heightCm: 180,
      currentWeightKg: 80,
      activityLevel: 'sedentary',
    });
    expect(calculateTDEE(p)).toBeCloseTo(1780 * 1.2, 0);
  });

  it('uses a higher multiplier for very active users', () => {
    const p = profile({
      gender: 'male',
      age: 30,
      heightCm: 180,
      currentWeightKg: 80,
      activityLevel: 'veryActive',
    });
    expect(calculateTDEE(p)).toBeCloseTo(1780 * 1.9, 0);
  });
});

describe('generatePlan', () => {
  it('produces a safe plan when the target date is reasonable', () => {
    const p = profile({
      currentWeightKg: 90,
      goalWeightKg: 85,
      targetDate: daysFromNow(90),
    });
    const plan = generatePlan(p);

    expect(plan.safe).toBe(true);
    expect(plan.targetCalories).toBeGreaterThan(1500);
    expect(plan.dailyDeficit).toBeGreaterThan(0);
    expect(plan.daysToTarget).toBe(90);
  });

  it('marks an aggressive plan unsafe and clamps to the male safety floor', () => {
    const p = profile({
      gender: 'male',
      currentWeightKg: 90,
      goalWeightKg: 70,
      targetDate: daysFromNow(30),
    });
    const plan = generatePlan(p);

    expect(plan.safe).toBe(false);
    expect(plan.targetCalories).toBe(1500);
    expect(plan.dailyDeficit).toBeGreaterThan(0);
    expect(plan.rate).toBe('aggressive');
  });

  it('clamps an aggressive female plan to the female safety floor', () => {
    const p = profile({
      gender: 'female',
      age: 30,
      heightCm: 165,
      currentWeightKg: 70,
      goalWeightKg: 60,
      activityLevel: 'sedentary',
      targetDate: daysFromNow(30),
    });
    const plan = generatePlan(p);

    expect(plan.safe).toBe(false);
    expect(plan.targetCalories).toBe(1200);
  });

  it('treats the exact safety floor as safe', () => {
    const p = profile({
      gender: 'male',
      currentWeightKg: 90,
      goalWeightKg: 85,
      activityLevel: 'sedentary',
      targetDate: daysFromNow(90),
    });

    const tdee = calculateTDEE(p);
    const daysToTarget = 90;
    const weightDelta = p.currentWeightKg - p.goalWeightKg;
    const rawDeficit = (weightDelta * 7700) / daysToTarget;
    const targetCalories = tdee - rawDeficit;

    expect(targetCalories).toBeGreaterThanOrEqual(1500);

    const plan = generatePlan(p);
    expect(plan.safe).toBe(true);
  });

  it('distributes macros so 4*p + 4*c + 9*f equals the calorie target', () => {
    const p = profile({
      currentWeightKg: 90,
      goalWeightKg: 85,
      targetDate: daysFromNow(90),
    });
    const plan = generatePlan(p);
    const { protein, carbs, fat } = plan.targetNutrients;
    const energy = Math.round(protein * 4 + carbs * 4 + fat * 9);

    expect(energy).toBe(plan.targetCalories);
  });

  it('classifies a small deficit as mild', () => {
    const p = profile({
      currentWeightKg: 90,
      goalWeightKg: 88,
      targetDate: daysFromNow(365),
    });
    const plan = generatePlan(p);

    expect(plan.rate).toBe('mild');
  });
});

describe('generatePlanOptions', () => {
  it('returns three safe options ordered mild to aggressive', () => {
    const p = profile({
      currentWeightKg: 100,
      goalWeightKg: 90,
      targetDate: daysFromNow(180),
    });
    const options = generatePlanOptions(p);

    expect(options).toHaveLength(3);
    expect(options.map((o) => o.rate)).toEqual([
      'mild',
      'moderate',
      'aggressive',
    ]);
    expect(options.every((o) => o.safe)).toBe(true);
  });

  it('returns options with increasing deficits and decreasing calories', () => {
    const p = profile({
      currentWeightKg: 100,
      goalWeightKg: 90,
      targetDate: daysFromNow(180),
    });
    const options = generatePlanOptions(p);

    expect(options[0].dailyDeficit).toBeLessThan(options[1].dailyDeficit);
    expect(options[1].dailyDeficit).toBeLessThan(options[2].dailyDeficit);
    expect(options[0].targetCalories).toBeGreaterThan(
      options[1].targetCalories,
    );
    expect(options[1].targetCalories).toBeGreaterThan(
      options[2].targetCalories,
    );
  });

  it('drops aggressive options that fall below the safety floor', () => {
    const p = profile({
      gender: 'female',
      age: 30,
      heightCm: 165,
      currentWeightKg: 55,
      goalWeightKg: 50,
      activityLevel: 'sedentary',
      targetDate: daysFromNow(90),
    });
    const options = generatePlanOptions(p);

    expect(options.length).toBeGreaterThanOrEqual(2);
    expect(options.every((o) => o.targetCalories >= 1200)).toBe(true);
    expect(options.every((o) => o.safe)).toBe(true);
  });

  it('computes days to target from the chosen deficit', () => {
    const p = profile({
      currentWeightKg: 90,
      goalWeightKg: 85,
      targetDate: daysFromNow(180),
    });
    const options = generatePlanOptions(p);

    options.forEach((option) => {
      expect(option.daysToTarget).toBeGreaterThan(0);
    });
  });

  it('returns zero days to target for weight-gain targets', () => {
    const p = profile({
      currentWeightKg: 70,
      goalWeightKg: 75,
      targetDate: daysFromNow(60),
    });
    const options = generatePlanOptions(p);

    expect(options.length).toBeGreaterThan(0);
    expect(options.every((o) => o.daysToTarget === 0)).toBe(true);
  });
});

describe('checkFeasibility', () => {
  it('reports a reasonable target as feasible', () => {
    const p = profile({
      currentWeightKg: 90,
      goalWeightKg: 85,
      targetDate: daysFromNow(90),
    });
    const result = checkFeasibility(p);

    expect(result.feasible).toBe(true);
    expect(result.minimumSafeDays).toBe(0);
  });

  it('reports an aggressive target as infeasible with minimum safe days', () => {
    const p = profile({
      gender: 'male',
      currentWeightKg: 90,
      goalWeightKg: 70,
      targetDate: daysFromNow(30),
    });
    const result = checkFeasibility(p);

    expect(result.feasible).toBe(false);
    expect(result.minimumSafeDays).toBeGreaterThan(30);
  });

  it('treats weight-gain targets as feasible because the floor does not apply', () => {
    const p = profile({
      currentWeightKg: 70,
      goalWeightKg: 75,
      targetDate: daysFromNow(60),
    });
    const result = checkFeasibility(p);

    expect(result.feasible).toBe(true);
    expect(result.requiredDailyDeficit).toBeLessThan(0);
  });
});

describe('daysBetween', () => {
  it('counts whole calendar days independent of time of day', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const laterToday = new Date(today);
    laterToday.setHours(23, 59, 59, 999);

    expect(daysBetween(laterToday, tomorrow)).toBe(1);
  });
});

describe('boundary cases', () => {
  it('treats a same-day target as one day and still produces a plan', () => {
    const p = profile({ targetDate: new Date() });
    const plan = generatePlan(p);

    expect(plan.daysToTarget).toBe(1);
    expect(plan.safe).toBe(false);
  });

  it('uses a minimum of one day when the target date is in the past', () => {
    const p = profile({ targetDate: daysFromNow(-10) });
    const plan = generatePlan(p);

    expect(plan.daysToTarget).toBe(1);
  });

  it('produces a maintenance plan when current weight equals goal weight', () => {
    const p = profile({
      currentWeightKg: 80,
      goalWeightKg: 80,
      targetDate: daysFromNow(30),
    });
    const plan = generatePlan(p);

    expect(plan.dailyDeficit).toBe(0);
    expect(plan.safe).toBe(true);
    expect(plan.targetCalories).toBe(Math.round(calculateTDEE(p)));
  });

  it('handles a profile whose TDEE is at the safety floor', () => {
    // A very small, sedentary woman whose TDEE is right at 1200 kcal.
    const p = profile({
      gender: 'female',
      age: 70,
      heightCm: 150,
      currentWeightKg: 35,
      goalWeightKg: 33,
      activityLevel: 'sedentary',
      targetDate: daysFromNow(30),
    });
    const tdee = calculateTDEE(p);
    expect(tdee).toBeLessThanOrEqual(1200);

    const result = checkFeasibility(p);
    expect(result.feasible).toBe(false);
    expect(result.minimumSafeDays).toBe(Infinity);
  });
});

describe('scaleNutrients', () => {
  it('scales per-100g values to the requested portion', () => {
    const per100g = {
      calories: 250,
      protein: 10,
      carbs: 30,
      fat: 8,
    };
    const scaled = scaleNutrients(per100g, 150);

    expect(scaled.calories).toBe(375);
    expect(scaled.protein).toBe(15);
    expect(scaled.carbs).toBe(45);
    expect(scaled.fat).toBe(12);
  });

  it('handles a zero-gram portion', () => {
    const per100g = {
      calories: 250,
      protein: 10,
      carbs: 30,
      fat: 8,
    };
    const scaled = scaleNutrients(per100g, 0);

    expect(scaled.calories).toBe(0);
    expect(scaled.protein).toBe(0);
    expect(scaled.carbs).toBe(0);
    expect(scaled.fat).toBe(0);
  });
});
