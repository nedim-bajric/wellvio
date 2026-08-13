import { InMemoryFoodRepository } from './food.in-memory.repository.js';
import { FoodNotFoundError } from './food-not-found.error.js';
import { apple, chicken } from './test-fixtures.js';

describe('InMemoryFoodRepository', () => {
  let repository: InMemoryFoodRepository;
  const userId = 'user-1';
  const otherUserId = 'user-2';

  beforeEach(() => {
    repository = new InMemoryFoodRepository();
  });

  describe('create', () => {
    it('creates a food with a generated id and timestamps', async () => {
      const result = await repository.create(userId, apple());

      expect(result.id).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.name).toBe('Apple');
      expect(result.nutrientsPer100g).toEqual(apple().nutrientsPer100g);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('findAll', () => {
    it('returns only foods belonging to the requested user', async () => {
      await repository.create(userId, apple());
      await repository.create(otherUserId, chicken());
      await repository.create(userId, chicken());

      const results = await repository.findAll(userId);

      expect(results).toHaveLength(2);
      expect(results.every((f) => f.userId === userId)).toBe(true);
    });

    it('returns an empty array when the user has no foods', async () => {
      const results = await repository.findAll(userId);

      expect(results).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('returns the food when it belongs to the user', async () => {
      const created = await repository.create(userId, apple());

      const result = await repository.findOne(userId, created.id);

      expect(result).toEqual(created);
    });

    it('returns null when the food does not exist', async () => {
      const result = await repository.findOne(userId, 'missing-id');

      expect(result).toBeNull();
    });

    it('returns null when the food belongs to another user', async () => {
      const created = await repository.create(userId, apple());

      const result = await repository.findOne(otherUserId, created.id);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('updates the food name and nutrients and refreshes updatedAt', async () => {
      const created = await repository.create(userId, apple());
      const originalUpdatedAt = created.updatedAt;

      const result = await repository.update(userId, created.id, {
        name: 'Green apple',
        nutrientsPer100g: { calories: 50, protein: 0.3, carbs: 13, fat: 0.2 },
      });

      expect(result.id).toBe(created.id);
      expect(result.name).toBe('Green apple');
      expect(result.nutrientsPer100g).toEqual({
        calories: 50,
        protein: 0.3,
        carbs: 13,
        fat: 0.2,
      });
      expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('throws FoodNotFoundError when updating a missing food', async () => {
      await expect(
        repository.update(userId, 'missing-id', { name: 'Tofu' }),
      ).rejects.toThrow(FoodNotFoundError);
    });

    it('throws FoodNotFoundError when updating another users food', async () => {
      const created = await repository.create(userId, apple());

      await expect(
        repository.update(otherUserId, created.id, { name: 'Tofu' }),
      ).rejects.toThrow(FoodNotFoundError);
    });
  });

  describe('remove', () => {
    it('deletes the food for the user', async () => {
      const created = await repository.create(userId, apple());

      await repository.remove(userId, created.id);

      expect(await repository.findOne(userId, created.id)).toBeNull();
    });

    it('throws FoodNotFoundError when deleting a missing food', async () => {
      await expect(repository.remove(userId, 'missing-id')).rejects.toThrow(
        FoodNotFoundError,
      );
    });

    it('throws FoodNotFoundError when deleting another users food', async () => {
      const created = await repository.create(userId, apple());

      await expect(repository.remove(otherUserId, created.id)).rejects.toThrow(
        FoodNotFoundError,
      );
    });
  });

  describe('removeAllByUserId', () => {
    it('deletes all foods for the user', async () => {
      await repository.create(userId, apple());
      await repository.create(userId, chicken());
      await repository.create(otherUserId, apple());

      await repository.removeAllByUserId(userId);

      expect(await repository.findAll(userId)).toEqual([]);
      expect(await repository.findAll(otherUserId)).toHaveLength(1);
    });

    it('does nothing when the user has no foods', async () => {
      await expect(repository.removeAllByUserId(userId)).resolves.toBeUndefined();
    });
  });
});
