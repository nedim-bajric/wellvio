import { Injectable } from '@nestjs/common';
import { startOfDayUtc } from '../common/date.util.js';
import { WeightLogRepository } from './weight-log.repository.js';
import { WeightLogNotFoundError } from './weight-log-not-found.error.js';
import {
  CreateWeightLogData,
  UpdateWeightLogData,
  WeightLog,
} from './weight-log.types.js';

function isWithinRange(date: Date, start: Date, end: Date): boolean {
  const day = startOfDayUtc(date).getTime();
  return (
    day >= startOfDayUtc(start).getTime() && day <= startOfDayUtc(end).getTime()
  );
}

@Injectable()
export class InMemoryWeightLogRepository implements WeightLogRepository {
  private readonly entries = new Map<string, WeightLog>();

  async create(userId: string, data: CreateWeightLogData): Promise<WeightLog> {
    const now = new Date();
    const entry: WeightLog = {
      id: crypto.randomUUID(),
      userId,
      weightKg: data.weightKg,
      loggedAt: data.loggedAt ? new Date(data.loggedAt) : now,
      createdAt: now,
      updatedAt: now,
    };
    this.entries.set(entry.id, entry);
    return entry;
  }

  async findAllByUserId(userId: string): Promise<WeightLog[]> {
    return Array.from(this.entries.values())
      .filter((entry) => entry.userId === userId)
      .sort((a, b) => b.loggedAt.getTime() - a.loggedAt.getTime());
  }

  async findAllByUserIdAndDateRange(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<WeightLog[]> {
    return (await this.findAllByUserId(userId)).filter((entry) =>
      isWithinRange(entry.loggedAt, start, end),
    );
  }

  async findOne(userId: string, id: string): Promise<WeightLog | null> {
    const entry = this.entries.get(id);
    return entry && entry.userId === userId ? entry : null;
  }

  async update(
    userId: string,
    id: string,
    data: UpdateWeightLogData,
  ): Promise<WeightLog> {
    const existing = this.entries.get(id);
    if (!existing || existing.userId !== userId) {
      throw new WeightLogNotFoundError(id);
    }
    const updated: WeightLog = {
      ...existing,
      weightKg: data.weightKg ?? existing.weightKg,
      loggedAt: data.loggedAt ? new Date(data.loggedAt) : existing.loggedAt,
      updatedAt: new Date(),
    };
    this.entries.set(id, updated);
    return updated;
  }

  async remove(userId: string, id: string): Promise<void> {
    const existing = this.entries.get(id);
    if (!existing || existing.userId !== userId) {
      throw new WeightLogNotFoundError(id);
    }
    this.entries.delete(id);
  }
}
