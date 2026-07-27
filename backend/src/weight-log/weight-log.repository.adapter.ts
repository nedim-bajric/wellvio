import { Injectable } from '@nestjs/common';
import { InMemoryWeightLogRepository } from './weight-log.in-memory.repository.js';

/**
 * Production repository adapter for WeightLog.
 *
 * Currently stores data in memory; the adapter seam exists so a persistent
 * database implementation can be swapped in later without changing consumers.
 */
@Injectable()
export class WeightLogRepositoryAdapter extends InMemoryWeightLogRepository {}
