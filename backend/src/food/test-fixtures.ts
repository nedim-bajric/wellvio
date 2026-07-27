import type { CreateFoodData } from './food.types.js';

export function apple(): CreateFoodData {
  return {
    name: 'Apple',
    nutrientsPer100g: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  };
}

export function chicken(): CreateFoodData {
  return {
    name: 'Chicken breast',
    nutrientsPer100g: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  };
}
