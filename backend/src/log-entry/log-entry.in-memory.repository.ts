import { Injectable } from '@nestjs/common';
import { LogEntryRepository } from './log-entry.repository.js';
import { LogEntryNotFoundError } from './log-entry-not-found.error.js';
import {
  CreateLogEntryData,
  LogEntry,
  UpdateLogEntryData,
} from './log-entry.types.js';

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

@Injectable()
export class InMemoryLogEntryRepository implements LogEntryRepository {
  private readonly entries = new Map<string, LogEntry>();

  async create(userId: string, data: CreateLogEntryData): Promise<LogEntry> {
    const now = new Date();
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      userId,
      foodId: data.foodId,
      foodName: '',
      grams: data.grams,
      nutrients: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      mealSlot: data.mealSlot,
      loggedAt: data.loggedAt ?? now,
      createdAt: now,
      updatedAt: now,
    };
    this.entries.set(entry.id, entry);
    return entry;
  }

  async findAllByUserIdAndDate(
    userId: string,
    date: Date,
  ): Promise<LogEntry[]> {
    return Array.from(this.entries.values()).filter(
      (entry) => entry.userId === userId && isSameDay(entry.loggedAt, date),
    );
  }

  async findOne(userId: string, id: string): Promise<LogEntry | null> {
    const entry = this.entries.get(id);
    return entry && entry.userId === userId ? entry : null;
  }

  async update(
    userId: string,
    id: string,
    data: UpdateLogEntryData,
  ): Promise<LogEntry> {
    const existing = this.entries.get(id);
    if (!existing || existing.userId !== userId) {
      throw new LogEntryNotFoundError(id);
    }
    const updated: LogEntry = {
      ...existing,
      foodId: data.foodId ?? existing.foodId,
      grams: data.grams ?? existing.grams,
      mealSlot: data.mealSlot ?? existing.mealSlot,
      loggedAt: data.loggedAt ?? existing.loggedAt,
      updatedAt: new Date(),
    };
    this.entries.set(id, updated);
    return updated;
  }

  async remove(userId: string, id: string): Promise<void> {
    const existing = this.entries.get(id);
    if (!existing || existing.userId !== userId) {
      throw new LogEntryNotFoundError(id);
    }
    this.entries.delete(id);
  }
}
