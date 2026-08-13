import {
  ERROR_CATALOG,
  FALLBACK_ERROR_CODE,
  type ErrorCatalogEntry,
  type ErrorCode,
} from './catalog';

export interface ResolvedError extends ErrorCatalogEntry {
  code: ErrorCode | string;
}

export interface ResolveErrorOptions {
  fallbackCode?: ErrorCode;
  overrides?: Partial<ErrorCatalogEntry>;
}

export function resolveError(
  code: string | undefined | null,
  options?: ResolveErrorOptions,
): ResolvedError {
  const fallbackCode = options?.fallbackCode ?? FALLBACK_ERROR_CODE;
  const entry: ErrorCatalogEntry =
    (code ? (ERROR_CATALOG as Record<string, ErrorCatalogEntry>)[code] : undefined) ??
    ERROR_CATALOG[fallbackCode];
  const overrides = options?.overrides ?? {};
  return {
    code: code ?? fallbackCode,
    message: overrides.message ?? entry.message,
    severity: overrides.severity ?? entry.severity,
    pattern: overrides.pattern ?? entry.pattern,
    field: overrides.field ?? entry.field,
  };
}

export function resolveFieldError(
  code: string | undefined | null,
  field: string,
): ResolvedError {
  const resolved = resolveError(code);
  if (resolved.pattern === 'inline' && resolved.field && resolved.field !== field) {
    return { ...resolved, pattern: 'toast', field: undefined };
  }
  return resolved;
}
