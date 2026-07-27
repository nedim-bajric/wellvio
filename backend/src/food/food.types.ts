import { Nutrients } from '../diet/diet.types.js';

export interface Food {
  id: string;
  userId: string;
  name: string;
  nutrientsPer100g: Nutrients;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFoodData {
  name: string;
  nutrientsPer100g: Nutrients;
}

export type UpdateFoodData = Partial<CreateFoodData>;
