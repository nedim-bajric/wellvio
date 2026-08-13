import { Inject, Injectable } from '@nestjs/common';
import { FOOD_REPOSITORY } from './food.repository.js';
import type { FoodRepository } from './food.repository.js';
import type { CreateFoodData, Food, UpdateFoodData } from './food.types.js';

@Injectable()
export class FoodService {
  constructor(
    @Inject(FOOD_REPOSITORY) private readonly repository: FoodRepository,
  ) {}

  create(userId: string, data: CreateFoodData): Promise<Food> {
    return this.repository.create(userId, data);
  }

  findAll(userId: string): Promise<Food[]> {
    return this.repository.findAll(userId);
  }

  findOne(userId: string, id: string): Promise<Food | null> {
    return this.repository.findOne(userId, id);
  }

  update(userId: string, id: string, data: UpdateFoodData): Promise<Food> {
    return this.repository.update(userId, id, data);
  }

  remove(userId: string, id: string): Promise<void> {
    return this.repository.remove(userId, id);
  }

  removeAllByUserId(userId: string): Promise<void> {
    return this.repository.removeAllByUserId(userId);
  }
}
