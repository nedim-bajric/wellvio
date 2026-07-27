import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsIn,
  IsInt,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import type { ActivityLevel, Gender, PlanRate } from '../diet/diet.types.js';

const GENDERS: Gender[] = ['male', 'female'];
const ACTIVITY_LEVELS: ActivityLevel[] = [
  'sedentary',
  'light',
  'moderate',
  'active',
  'veryActive',
];
const PLAN_RATES: PlanRate[] = ['mild', 'moderate', 'aggressive'];

export class CreateProfileDto {
  @IsIn(GENDERS)
  gender: Gender;

  @IsInt()
  @Min(13)
  @Max(120)
  age: number;

  @IsNumber()
  @Min(50)
  @Max(300)
  heightCm: number;

  @IsNumber()
  @Min(20)
  @Max(500)
  currentWeightKg: number;

  @IsNumber()
  @Min(20)
  @Max(500)
  goalWeightKg: number;

  @IsIn(ACTIVITY_LEVELS)
  activityLevel: ActivityLevel;

  @IsDate()
  @Type(() => Date)
  targetDate: Date;

  @IsBoolean()
  healthDisclaimerAcknowledged: boolean;
}

export class ActivatePlanDto {
  @IsIn(PLAN_RATES)
  rate: PlanRate;
}
