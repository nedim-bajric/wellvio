import { InMemoryLogEntryRepository } from './log-entry.in-memory.repository.js';
import { LogEntryNotFoundError } from './log-entry-not-found.error.js';

describe('InMemoryLogEntryRepository', () => {
  let repository: InMemoryLogEntryRepository;
  const userId = 'user-1';
  const otherUserId = 'user-2';

  beforeEach(() => {
    repository = new InMemoryLogEntryRepository();
  });

  describe('create', () => {
    it('creates a log entry with a generated id and timestamps', async () => {
      const result = await repository.create(userId, {
        foodId: 'food-1',
        grams: 150,
        mealSlot: 'breakfast',
      });

      expect(result.id).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.foodId).toBe('food-1');
      expect(result.grams).toBe(150);
      expect(result.mealSlot).toBe('breakfast');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('uses the provided loggedAt date', async () => {
      const loggedAt = new Date('2026-07-27T12:00:00Z');
      const result = await repository.create(userId, {
        foodId: 'food-1',
        grams: 100,
        mealSlot: 'lunch',
        loggedAt,
      });

      expect(result.loggedAt).toEqual(loggedAt);
    });
  });

  describe('findAllByUserIdAndDate', () => {
    it('returns only entries for the user on the requested date', async () => {
      const today = new Date('2026-07-27T10:00:00Z');
      const yesterday = new Date('2026-07-26T10:00:00Z');

      await repository.create(userId, {
        foodId: 'food-1',
        grams: 100,
        mealSlot: 'breakfast',
        loggedAt: today,
      });
      await repository.create(userId, {
        foodId: 'food-2',
        grams: 200,
        mealSlot: 'lunch',
        loggedAt: yesterday,
      });
      await repository.create(otherUserId, {
        foodId: 'food-1',
        grams: 100,
        mealSlot: 'breakfast',
        loggedAt: today,
      });

      const results = await repository.findAllByUserIdAndDate(userId, today);

      expect(results).toHaveLength(1);
      expect(results[0].foodId).toBe('food-1');
    });
  });

  describe('findOne', () => {
    it('returns the entry when it belongs to the user', async () => {
      const created = await repository.create(userId, {
        foodId: 'food-1',
        grams: 100,
        mealSlot: 'breakfast',
      });

      const result = await repository.findOne(userId, created.id);

      expect(result).toEqual(created);
    });

    it('returns null for a missing entry', async () => {
      const result = await repository.findOne(userId, 'missing-id');
      expect(result).toBeNull();
    });

    it('returns null for another users entry', async () => {
      const created = await repository.create(userId, {
        foodId: 'food-1',
        grams: 100,
        mealSlot: 'breakfast',
      });

      const result = await repository.findOne(otherUserId, created.id);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('updates the entry and refreshes updatedAt', async () => {
      const created = await repository.create(userId, {
        foodId: 'food-1',
        grams: 100,
        mealSlot: 'breakfast',
      });
      const originalUpdatedAt = created.updatedAt;

      const result = await repository.update(userId, created.id, {
        grams: 200,
        mealSlot: 'lunch',
      });

      expect(result.grams).toBe(200);
      expect(result.mealSlot).toBe('lunch');
      expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('throws LogEntryNotFoundError for a missing entry', async () => {
      await expect(
        repository.update(userId, 'missing-id', { grams: 200 }),
      ).rejects.toThrow(LogEntryNotFoundError);
    });

    it('throws LogEntryNotFoundError for another users entry', async () => {
      const created = await repository.create(userId, {
        foodId: 'food-1',
        grams: 100,
        mealSlot: 'breakfast',
      });

      await expect(
        repository.update(otherUserId, created.id, { grams: 200 }),
      ).rejects.toThrow(LogEntryNotFoundError);
    });
  });

  describe('remove', () => {
    it('deletes the entry for the user', async () => {
      const created = await repository.create(userId, {
        foodId: 'food-1',
        grams: 100,
        mealSlot: 'breakfast',
      });

      await repository.remove(userId, created.id);

      expect(await repository.findOne(userId, created.id)).toBeNull();
    });

    it('throws LogEntryNotFoundError for a missing entry', async () => {
      await expect(repository.remove(userId, 'missing-id')).rejects.toThrow(
        LogEntryNotFoundError,
      );
    });

    it('throws LogEntryNotFoundError for another users entry', async () => {
      const created = await repository.create(userId, {
        foodId: 'food-1',
        grams: 100,
        mealSlot: 'breakfast',
      });

      await expect(repository.remove(otherUserId, created.id)).rejects.toThrow(
        LogEntryNotFoundError,
      );
    });
  });

  describe('removeAllByUserId', () => {
    it('deletes all entries for the user', async () => {
      const today = new Date('2026-07-27T10:00:00Z');
      await repository.create(userId, {
        foodId: 'food-1',
        grams: 100,
        mealSlot: 'breakfast',
        loggedAt: today,
      });
      await repository.create(userId, {
        foodId: 'food-2',
        grams: 200,
        mealSlot: 'lunch',
        loggedAt: today,
      });
      await repository.create(otherUserId, {
        foodId: 'food-1',
        grams: 100,
        mealSlot: 'breakfast',
        loggedAt: today,
      });

      await repository.removeAllByUserId(userId);

      expect(
        await repository.findAllByUserIdAndDate(userId, today),
      ).toEqual([]);
      expect(
        await repository.findAllByUserIdAndDate(otherUserId, today),
      ).toHaveLength(1);
    });

    it('does nothing when the user has no entries', async () => {
      await expect(repository.removeAllByUserId(userId)).resolves.toBeUndefined();
    });
  });
});
