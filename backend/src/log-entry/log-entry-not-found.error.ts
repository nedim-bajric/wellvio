export class LogEntryNotFoundError extends Error {
  constructor(id: string) {
    super(`Log entry not found: ${id}`);
  }
}
