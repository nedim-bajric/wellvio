import { Injectable } from '@nestjs/common';
import { ProfileRepository } from './profile.repository.js';
import { ProfileNotFoundError } from './onboarding.errors.js';
import {
  CreateProfileData,
  Profile,
  UpdateProfileData,
} from './onboarding.types.js';

@Injectable()
export class InMemoryProfileRepository implements ProfileRepository {
  private readonly profiles = new Map<string, Profile>();

  async create(userId: string, data: CreateProfileData): Promise<Profile> {
    const now = new Date();
    const profile: Profile = {
      id: crypto.randomUUID(),
      userId,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.profiles.set(userId, profile);
    return profile;
  }

  async findByUserId(userId: string): Promise<Profile | null> {
    return this.profiles.get(userId) ?? null;
  }

  async update(userId: string, data: UpdateProfileData): Promise<Profile> {
    const existing = this.profiles.get(userId);
    if (!existing) {
      throw new ProfileNotFoundError(userId);
    }
    const updated: Profile = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
    this.profiles.set(userId, updated);
    return updated;
  }

  async removeByUserId(userId: string): Promise<void> {
    this.profiles.delete(userId);
  }
}
