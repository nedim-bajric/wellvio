import { CreateFoodData, Food, UpdateFoodData } from './food.types.js';

export const FOOD_REPOSITORY = Symbol('FOOD_REPOSITORY');

export interface FoodRepository {
  create(userId: string, data: CreateFoodData): Promise<Food>;
  findAll(userId: string): Promise<Food[]>;
  findOne(userId: string, id: string): Promise<Food | null>;
  update(userId: string, id: string, data: UpdateFoodData): Promise<Food>;
  remove(userId: string, id: string): Promise<void>;
}
