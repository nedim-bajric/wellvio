import {
  CreateProfileData,
  Profile,
  UpdateProfileData,
} from './onboarding.types.js';

export const PROFILE_REPOSITORY = Symbol('PROFILE_REPOSITORY');

export interface ProfileRepository {
  create(userId: string, data: CreateProfileData): Promise<Profile>;
  findByUserId(userId: string): Promise<Profile | null>;
  update(userId: string, data: UpdateProfileData): Promise<Profile>;
}
