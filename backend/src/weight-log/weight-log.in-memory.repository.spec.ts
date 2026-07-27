import { InMemoryWeightLogRepository } from './weight-log.in-memory.repository.js';
import { WeightLogNotFoundError } from './weight-log-not-found.error.js';

describe('InMemoryWeightLogRepository', () => {
  let repository: InMemoryWeightLogRepository;
  const userId = 'user-1';
  const otherUserId = 'user-2';

  beforeEach(() => {
    repository = new InMemoryWeightLogRepository();
  });

  describe('create', () => {
    it('creates a weight log with a generated id and timestamps', async () => {
      const result = await repository.create(userId, {
        weightKg: 82.5,
      });

      expect(result.id).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.weightKg).toBe(82.5);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('uses the provided loggedAt date', async () => {
      const loggedAt = new Date('2026-07-27T08:00:00Z');
      const result = await repository.create(userId, {
        weightKg: 80,
        loggedAt,
      });

      expect(result.loggedAt).toEqual(loggedAt);
    });
  });

  describe('findAllByUserId', () => {
    it('returns only entries for the user sorted by loggedAt desc', async () => {
      await repository.create(userId, {
        weightKg: 82,
        loggedAt: new Date('2026-07-20T08:00:00Z'),
      });
      const latest = await repository.create(userId, {
        weightKg: 81,
        loggedAt: new Date('2026-07-27T08:00:00Z'),
      });
      await repository.create(otherUserId, {
        weightKg: 70,
        loggedAt: new Date('2026-07-27T08:00:00Z'),
      });

      const results = await repository.findAllByUserId(userId);

      expect(results).toHaveLength(2);
      expect(results[0].id).toBe(latest.id);
    });
  });

  describe('findAllByUserIdAndDateRange', () => {
    it('returns entries within the inclusive UTC date range', async () => {
      await repository.create(userId, {
        weightKg: 82,
        loggedAt: new Date('2026-07-26T23:00:00Z'),
      });
      const inside = await repository.create(userId, {
        weightKg: 81.5,
        loggedAt: new Date('2026-07-27T08:00:00Z'),
      });
      await repository.create(userId, {
        weightKg: 81,
        loggedAt: new Date('2026-07-28T01:00:00Z'),
      });

      const results = await repository.findAllByUserIdAndDateRange(
        userId,
        new Date('2026-07-27T00:00:00Z'),
        new Date('2026-07-27T23:59:59Z'),
      );

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(inside.id);
    });
  });

  describe('findOne', () => {
    it('returns the entry when it belongs to the user', async () => {
      const created = await repository.create(userId, { weightKg: 80 });

      const result = await repository.findOne(userId, created.id);

      expect(result).toEqual(created);
    });

    it('returns null for a missing entry', async () => {
      const result = await repository.findOne(userId, 'missing-id');
      expect(result).toBeNull();
    });

    it('returns null for another users entry', async () => {
      const created = await repository.create(userId, { weightKg: 80 });

      const result = await repository.findOne(otherUserId, created.id);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('updates the entry and refreshes updatedAt', async () => {
      const created = await repository.create(userId, { weightKg: 80 });
      const originalUpdatedAt = created.updatedAt;

      const result = await repository.update(userId, created.id, {
        weightKg: 79,
      });

      expect(result.weightKg).toBe(79);
      expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('throws WeightLogNotFoundError for a missing entry', async () => {
      await expect(
        repository.update(userId, 'missing-id', { weightKg: 79 }),
      ).rejects.toThrow(WeightLogNotFoundError);
    });

    it('throws WeightLogNotFoundError for another users entry', async () => {
      const created = await repository.create(userId, { weightKg: 80 });

      await expect(
        repository.update(otherUserId, created.id, { weightKg: 79 }),
      ).rejects.toThrow(WeightLogNotFoundError);
    });
  });

  describe('remove', () => {
    it('deletes the entry for the user', async () => {
      const created = await repository.create(userId, { weightKg: 80 });

      await repository.remove(userId, created.id);

      expect(await repository.findOne(userId, created.id)).toBeNull();
    });

    it('throws WeightLogNotFoundError for a missing entry', async () => {
      await expect(repository.remove(userId, 'missing-id')).rejects.toThrow(
        WeightLogNotFoundError,
      );
    });

    it('throws WeightLogNotFoundError for another users entry', async () => {
      const created = await repository.create(userId, { weightKg: 80 });

      await expect(repository.remove(otherUserId, created.id)).rejects.toThrow(
        WeightLogNotFoundError,
      );
    });
  });
});
