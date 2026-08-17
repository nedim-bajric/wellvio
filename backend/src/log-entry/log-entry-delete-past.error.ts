export class LogEntryDeletePastError extends Error {
  constructor(id: string) {
    super(`Cannot delete past log entry: ${id}`);
  }
}
