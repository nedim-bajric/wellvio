import type { Gender } from './onboarding';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'veryActive';

export interface SupabaseProfile {
  id: string;
  user_id: string;
  gender: Gender | null;
  date_of_birth: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  goal_weight_kg: number | null;
  activity_level: ActivityLevel | null;
  target_date: string | null;
  health_disclaimer_acknowledged: boolean;
  active_plan_id: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
