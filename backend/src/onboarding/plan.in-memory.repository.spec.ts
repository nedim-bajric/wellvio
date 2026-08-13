import { InMemoryPlanRepository } from './plan.in-memory.repository.js';

function createPlanData(
  partial: { userId: string; active?: boolean } = { userId: 'user-1' },
) {
  return {
    userId: partial.userId,
    profileId: 'profile-1',
    targetCalories: 1800,
    targetNutrients: {
      calories: 1800,
      protein: 135,
      carbs: 180,
      fat: 60,
    },
    dailyDeficit: 300,
    daysToTarget: 90,
    rate: 'moderate' as const,
    safe: true,
    active: partial.active ?? false,
  };
}

describe('InMemoryPlanRepository', () => {
  let repository: InMemoryPlanRepository;
  const userId = 'user-1';
  const otherUserId = 'user-2';

  beforeEach(() => {
    repository = new InMemoryPlanRepository();
  });

  describe('create', () => {
    it('creates a plan with generated id and timestamps', async () => {
      const result = await repository.create(createPlanData({ userId }));

      expect(result.id).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.active).toBe(false);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('findActiveByUserId', () => {
    it('returns only the active plan for the user', async () => {
      await repository.create(createPlanData({ userId, active: true }));
      await repository.create(createPlanData({ userId, active: false }));

      const result = await repository.findActiveByUserId(userId);

      expect(result).not.toBeNull();
      expect(result!.active).toBe(true);
    });

    it('returns null when the user has no active plan', async () => {
      await repository.create(createPlanData({ userId, active: false }));

      const result = await repository.findActiveByUserId(userId);

      expect(result).toBeNull();
    });

    it('does not return another users active plan', async () => {
      await repository.create(
        createPlanData({ userId: otherUserId, active: true }),
      );

      const result = await repository.findActiveByUserId(userId);

      expect(result).toBeNull();
    });
  });

  describe('deactivateAll', () => {
    it('deactivates all active plans for the user', async () => {
      await repository.create(createPlanData({ userId, active: true }));

      await repository.deactivateAll(userId);

      const result = await repository.findActiveByUserId(userId);
      expect(result).toBeNull();
    });

    it('does not deactivate plans for other users', async () => {
      await repository.create(
        createPlanData({ userId: otherUserId, active: true }),
      );

      await repository.deactivateAll(userId);

      const result = await repository.findActiveByUserId(otherUserId);
      expect(result).not.toBeNull();
      expect(result!.active).toBe(true);
    });
  });

  describe('removeAllByUserId', () => {
    it('deletes all plans for the user', async () => {
      await repository.create(createPlanData({ userId, active: true }));
      await repository.create(createPlanData({ userId, active: false }));
      await repository.create(
        createPlanData({ userId: otherUserId, active: true }),
      );

      await repository.removeAllByUserId(userId);

      expect(await repository.findActiveByUserId(userId)).toBeNull();
      const otherResult = await repository.findActiveByUserId(otherUserId);
      expect(otherResult).not.toBeNull();
      expect(otherResult!.active).toBe(true);
    });

    it('does nothing when the user has no plans', async () => {
      await expect(repository.removeAllByUserId(userId)).resolves.toBeUndefined();
    });
  });
});
