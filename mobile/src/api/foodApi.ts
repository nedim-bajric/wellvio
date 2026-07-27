import { apiClient } from './client.js';
import type { CreateFoodData, Food, UpdateFoodData } from '../types/food.js';

const FOODS_PATH = '/foods';

export const foodApi = {
  list: () => apiClient.get<Food[]>(FOODS_PATH),
  get: (id: string) => apiClient.get<Food>(`${FOODS_PATH}/${id}`),
  create: (data: CreateFoodData) => apiClient.post<Food>(FOODS_PATH, data),
  update: (id: string, data: UpdateFoodData) =>
    apiClient.patch<Food>(`${FOODS_PATH}/${id}`, data),
  remove: (id: string) => apiClient.delete(`${FOODS_PATH}/${id}`),
};
