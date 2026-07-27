export interface Nutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Food {
  id: string;
  userId: string;
  name: string;
  nutrientsPer100g: Nutrients;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFoodData {
  name: string;
  nutrientsPer100g: Nutrients;
}

export type UpdateFoodData = Partial<CreateFoodData>;
