import { apiClient } from './client';
import type {
  CreateLogEntryData,
  DailyDashboard,
  LogEntry,
  UpdateLogEntryData,
} from '../types/logEntry';

const LOG_ENTRIES_PATH = '/log-entries';

export const logEntryApi = {
  list: (date?: string) =>
    apiClient.get<LogEntry[]>(
      `${LOG_ENTRIES_PATH}${date ? `?date=${encodeURIComponent(date)}` : ''}`,
    ),
  getDashboard: (date?: string) =>
    apiClient.get<DailyDashboard>(
      `${LOG_ENTRIES_PATH}/dashboard${date ? `?date=${encodeURIComponent(date)}` : ''}`,
    ),
  create: (data: CreateLogEntryData) =>
    apiClient.post<LogEntry>(LOG_ENTRIES_PATH, data),
  update: (id: string, data: UpdateLogEntryData) =>
    apiClient.patch<LogEntry>(`${LOG_ENTRIES_PATH}/${id}`, data),
  remove: (id: string) =>
    apiClient.delete(`${LOG_ENTRIES_PATH}/${id}`) as Promise<void>,
};
