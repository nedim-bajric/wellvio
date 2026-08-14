import { supabase } from '../lib/supabase';
import type { CreateFoodData, Food, UpdateFoodData } from '../types/food';

interface FoodRow {
  id: string;
  user_id: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  created_at: string;
  updated_at: string;
}

function toFood(row: FoodRow): Food {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    nutrientsPer100g: {
      calories: row.calories_per_100g,
      protein: row.protein_per_100g,
      carbs: row.carbs_per_100g,
      fat: row.fat_per_100g,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toCreateRow(
  data: CreateFoodData,
  userId: string,
): Omit<FoodRow, 'id' | 'created_at' | 'updated_at'> {
  return {
    user_id: userId,
    name: data.name,
    calories_per_100g: data.nutrientsPer100g.calories,
    protein_per_100g: data.nutrientsPer100g.protein,
    carbs_per_100g: data.nutrientsPer100g.carbs,
    fat_per_100g: data.nutrientsPer100g.fat,
  };
}

function toUpdateRow(
  data: UpdateFoodData,
): Partial<Omit<FoodRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>> {
  const row: Partial<Omit<FoodRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>> = {};

  if (data.name !== undefined) {
    row.name = data.name;
  }

  if (data.nutrientsPer100g !== undefined) {
    row.calories_per_100g = data.nutrientsPer100g.calories;
    row.protein_per_100g = data.nutrientsPer100g.protein;
    row.carbs_per_100g = data.nutrientsPer100g.carbs;
    row.fat_per_100g = data.nutrientsPer100g.fat;
  }

  return row;
}

async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session?.user) {
    throw new Error('User not authenticated');
  }

  return data.session.user.id;
}

export const foodApi = {
  async list(): Promise<Food[]> {
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => toFood(row as FoodRow));
  },

  async get(id: string): Promise<Food> {
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('Food not found');
    }

    return toFood(data as FoodRow);
  },

  async create(data: CreateFoodData): Promise<Food> {
    const userId = await getCurrentUserId();

    const { data: row, error } = await supabase
      .from('foods')
      .insert(toCreateRow(data, userId))
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!row) {
      throw new Error('Failed to create food');
    }

    return toFood(row as FoodRow);
  },

  async update(id: string, data: UpdateFoodData): Promise<Food> {
    const { data: row, error } = await supabase
      .from('foods')
      .update(toUpdateRow(data))
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!row) {
      throw new Error('Failed to update food');
    }

    return toFood(row as FoodRow);
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('foods').delete().eq('id', id);

    if (error) {
      throw error;
    }
  },
};
