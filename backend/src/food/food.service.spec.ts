import { Test, TestingModule } from '@nestjs/testing';
import { FoodService } from './food.service.js';
import { FOOD_REPOSITORY } from './food.repository.js';
import { apple } from './test-fixtures.js';
import type { FoodRepository } from './food.repository.js';
import type { Food } from './food.types.js';

describe('FoodService', () => {
  let service: FoodService;
  let repository: FoodRepository;
  const userId = 'user-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoodService,
        {
          provide: FOOD_REPOSITORY,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FoodService>(FoodService);
    repository = module.get<FoodRepository>(FOOD_REPOSITORY);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('delegates to the repository', async () => {
      const created: Food = {
        id: 'food-1',
        userId,
        ...apple(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(repository, 'create').mockResolvedValue(created);

      const result = await service.create(userId, apple());

      expect(repository.create).toHaveBeenCalledWith(userId, apple());
      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('delegates to the repository', async () => {
      const foods: Food[] = [
        {
          id: 'food-1',
          userId,
          ...apple(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      jest.spyOn(repository, 'findAll').mockResolvedValue(foods);

      const result = await service.findAll(userId);

      expect(repository.findAll).toHaveBeenCalledWith(userId);
      expect(result).toEqual(foods);
    });
  });

  describe('findOne', () => {
    it('delegates to the repository', async () => {
      const food: Food = {
        id: 'food-1',
        userId,
        ...apple(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(food);

      const result = await service.findOne(userId, 'food-1');

      expect(repository.findOne).toHaveBeenCalledWith(userId, 'food-1');
      expect(result).toEqual(food);
    });
  });

  describe('update', () => {
    it('delegates to the repository', async () => {
      const updated: Food = {
        id: 'food-1',
        userId,
        name: 'Green apple',
        nutrientsPer100g: {
          calories: 50,
          protein: 0.3,
          carbs: 13,
          fat: 0.2,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(repository, 'update').mockResolvedValue(updated);

      const result = await service.update(userId, 'food-1', {
        name: 'Green apple',
      });

      expect(repository.update).toHaveBeenCalledWith(userId, 'food-1', {
        name: 'Green apple',
      });
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('delegates to the repository', async () => {
      jest.spyOn(repository, 'remove').mockResolvedValue(undefined);

      await service.remove(userId, 'food-1');

      expect(repository.remove).toHaveBeenCalledWith(userId, 'food-1');
    });
  });
});
