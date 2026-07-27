import { Injectable } from '@nestjs/common';
import {
  calculateBMR,
  calculateTDEE,
  generatePlan,
  checkFeasibility,
  scaleNutrients,
} from './diet.calculations.js';
import {
  FeasibilityResult,
  Nutrients,
  Plan,
  UserProfile,
} from './diet.types.js';

@Injectable()
export class DietService {
  calculateBMR(profile: UserProfile): number {
    return calculateBMR(profile);
  }

  calculateTDEE(profile: UserProfile): number {
    return calculateTDEE(profile);
  }

  generatePlan(profile: UserProfile): Plan {
    return generatePlan(profile);
  }

  checkFeasibility(profile: UserProfile): FeasibilityResult {
    return checkFeasibility(profile);
  }

  scaleNutrients(per100g: Nutrients, grams: number): Nutrients {
    return scaleNutrients(per100g, grams);
  }
}
