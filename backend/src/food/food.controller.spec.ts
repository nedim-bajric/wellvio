import { Test, TestingModule } from '@nestjs/testing';
import { FoodController } from './food.controller.js';
import { FoodService } from './food.service.js';
import { FoodNotFoundError } from './food-not-found.error.js';
import { apple } from './test-fixtures.js';
import type { Food } from './food.types.js';

describe('FoodController', () => {
  let controller: FoodController;
  let service: FoodService;
  const userId = 'user-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoodController],
      providers: [
        {
          provide: FoodService,
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

    controller = module.get<FoodController>(FoodController);
    service = module.get<FoodService>(FoodService);
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('creates a food for the user', async () => {
      const created: Food = {
        id: 'food-1',
        userId,
        ...apple(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(service, 'create').mockResolvedValue(created);

      const result = await controller.create(userId, apple());

      expect(service.create).toHaveBeenCalledWith(userId, apple());
      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('lists foods for the user', async () => {
      const foods: Food[] = [
        {
          id: 'food-1',
          userId,
          ...apple(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      jest.spyOn(service, 'findAll').mockResolvedValue(foods);

      const result = await controller.findAll(userId);

      expect(service.findAll).toHaveBeenCalledWith(userId);
      expect(result).toEqual(foods);
    });
  });

  describe('findOne', () => {
    it('returns a single food for the user', async () => {
      const food: Food = {
        id: 'food-1',
        userId,
        ...apple(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(food);

      const result = await controller.findOne(userId, 'food-1');

      expect(service.findOne).toHaveBeenCalledWith(userId, 'food-1');
      expect(result).toEqual(food);
    });

    it('throws FoodNotFoundError when the food is missing', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(controller.findOne(userId, 'food-1')).rejects.toThrow(
        FoodNotFoundError,
      );
    });
  });

  describe('update', () => {
    it('updates a food for the user', async () => {
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
      jest.spyOn(service, 'update').mockResolvedValue(updated);

      const result = await controller.update(userId, 'food-1', {
        name: 'Green apple',
      });

      expect(service.update).toHaveBeenCalledWith(userId, 'food-1', {
        name: 'Green apple',
      });
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('deletes a food for the user', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await controller.remove(userId, 'food-1');

      expect(service.remove).toHaveBeenCalledWith(userId, 'food-1');
    });
  });
});
