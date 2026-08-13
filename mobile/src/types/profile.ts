import type { Gender } from './onboarding';

export interface SupabaseProfile {
  id: string;
  user_id: string;
  gender: Gender | null;
  date_of_birth: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
