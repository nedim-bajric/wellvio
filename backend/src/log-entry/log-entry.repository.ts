import {
  CreateLogEntryData,
  LogEntry,
  MealSlot,
  UpdateLogEntryData,
} from './log-entry.types.js';

export const LOG_ENTRY_REPOSITORY = Symbol('LOG_ENTRY_REPOSITORY');

export interface LogEntryRepository {
  create(userId: string, data: CreateLogEntryData): Promise<LogEntry>;
  findAllByUserIdAndDate(
    userId: string,
    date: Date,
  ): Promise<LogEntry[]>;
  findOne(userId: string, id: string): Promise<LogEntry | null>;
  update(
    userId: string,
    id: string,
    data: UpdateLogEntryData,
  ): Promise<LogEntry>;
  remove(userId: string, id: string): Promise<void>;
  removeAllByUserId(userId: string): Promise<void>;
}
