import { InMemoryProfileRepository } from './profile.in-memory.repository.js';
import { ProfileNotFoundError } from './onboarding.errors.js';

function createProfileData() {
  return {
    gender: 'male' as const,
    age: 30,
    heightCm: 180,
    currentWeightKg: 90,
    goalWeightKg: 85,
    activityLevel: 'sedentary' as const,
    targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    healthDisclaimerAcknowledged: false,
  };
}

describe('InMemoryProfileRepository', () => {
  let repository: InMemoryProfileRepository;
  const userId = 'user-1';

  beforeEach(() => {
    repository = new InMemoryProfileRepository();
  });

  describe('create', () => {
    it('creates a profile with generated id and timestamps', async () => {
      const result = await repository.create(userId, createProfileData());

      expect(result.id).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.age).toBe(30);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('findByUserId', () => {
    it('returns the profile for the user', async () => {
      const created = await repository.create(userId, createProfileData());

      const result = await repository.findByUserId(userId);

      expect(result).toEqual(created);
    });

    it('returns null when the user has no profile', async () => {
      const result = await repository.findByUserId(userId);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('updates the profile and refreshes updatedAt', async () => {
      const created = await repository.create(userId, createProfileData());
      const originalUpdatedAt = created.updatedAt;

      const result = await repository.update(userId, {
        currentWeightKg: 88,
        healthDisclaimerAcknowledged: true,
      });

      expect(result.id).toBe(created.id);
      expect(result.currentWeightKg).toBe(88);
      expect(result.healthDisclaimerAcknowledged).toBe(true);
      expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('throws ProfileNotFoundError when updating a missing profile', async () => {
      await expect(repository.update(userId, { age: 31 })).rejects.toThrow(
        ProfileNotFoundError,
      );
    });
  });
});
