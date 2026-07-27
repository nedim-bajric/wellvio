export function formatToday(): string {
  return new Date().toISOString().split('T')[0];
}
