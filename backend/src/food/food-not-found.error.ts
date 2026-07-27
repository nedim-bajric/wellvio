export class FoodNotFoundError extends Error {
  constructor(id: string) {
    super(`Food ${id} not found`);
    this.name = 'FoodNotFoundError';
  }
}
