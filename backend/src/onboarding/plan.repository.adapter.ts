import { Injectable } from '@nestjs/common';
import { InMemoryPlanRepository } from './plan.in-memory.repository.js';

/**
 * Production repository adapter for Plan.
 *
 * Currently stores data in memory; the adapter seam exists so a persistent
 * database implementation can be swapped in later without changing consumers.
 */
@Injectable()
export class PlanRepositoryAdapter extends InMemoryPlanRepository {}
