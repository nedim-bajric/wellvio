export function getErrorMessage(
  err: unknown,
  fallback: string = 'Something went wrong',
): string {
  return err instanceof Error ? err.message : fallback;
}
