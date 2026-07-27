export class WeightLogNotFoundError extends Error {
  constructor(id: string) {
    super(`Weight log not found: ${id}`);
  }
}
