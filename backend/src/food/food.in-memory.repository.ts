import { Injectable } from '@nestjs/common';
import { FoodRepository } from './food.repository.js';
import { FoodNotFoundError } from './food-not-found.error.js';
import { CreateFoodData, Food, UpdateFoodData } from './food.types.js';

@Injectable()
export class InMemoryFoodRepository implements FoodRepository {
  private readonly foods = new Map<string, Food>();

  async create(userId: string, data: CreateFoodData): Promise<Food> {
    const now = new Date();
    const food: Food = {
      id: crypto.randomUUID(),
      userId,
      name: data.name,
      nutrientsPer100g: data.nutrientsPer100g,
      createdAt: now,
      updatedAt: now,
    };
    this.foods.set(food.id, food);
    return food;
  }

  async findAll(userId: string): Promise<Food[]> {
    return Array.from(this.foods.values()).filter(
      (food) => food.userId === userId,
    );
  }

  async findOne(userId: string, id: string): Promise<Food | null> {
    const food = this.foods.get(id);
    return food && food.userId === userId ? food : null;
  }

  async update(
    userId: string,
    id: string,
    data: UpdateFoodData,
  ): Promise<Food> {
    const existing = this.foods.get(id);
    if (!existing || existing.userId !== userId) {
      throw new FoodNotFoundError(id);
    }
    const updated: Food = {
      ...existing,
      name: data.name ?? existing.name,
      nutrientsPer100g: data.nutrientsPer100g ?? existing.nutrientsPer100g,
      updatedAt: new Date(),
    };
    this.foods.set(id, updated);
    return updated;
  }

  async remove(userId: string, id: string): Promise<void> {
    const existing = this.foods.get(id);
    if (!existing || existing.userId !== userId) {
      throw new FoodNotFoundError(id);
    }
    this.foods.delete(id);
  }
}
