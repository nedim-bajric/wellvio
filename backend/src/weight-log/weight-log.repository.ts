import {
  CreateWeightLogData,
  UpdateWeightLogData,
  WeightLog,
} from './weight-log.types.js';

export const WEIGHT_LOG_REPOSITORY = Symbol('WEIGHT_LOG_REPOSITORY');

export interface WeightLogRepository {
  create(userId: string, data: CreateWeightLogData): Promise<WeightLog>;
  findAllByUserId(userId: string): Promise<WeightLog[]>;
  findAllByUserIdAndDateRange(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<WeightLog[]>;
  findOne(userId: string, id: string): Promise<WeightLog | null>;
  update(
    userId: string,
    id: string,
    data: UpdateWeightLogData,
  ): Promise<WeightLog>;
  remove(userId: string, id: string): Promise<void>;
}
