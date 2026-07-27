import { Injectable } from '@nestjs/common';
import { InMemoryFoodRepository } from './food.in-memory.repository.js';

/**
 * Production repository adapter for Food.
 *
 * Currently stores data in memory; the adapter seam exists so a persistent
 * database implementation can be swapped in later without changing consumers.
 */
@Injectable()
export class FoodRepositoryAdapter extends InMemoryFoodRepository {}
