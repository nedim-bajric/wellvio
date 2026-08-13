import type { AuthError } from '@supabase/supabase-js';
import { mapSupabaseAuthErrorCode } from './supabase';
import { showErrorToast } from './toast';
import type { ResolvedError } from './resolveError';

export function showAuthErrorToast(
  error: AuthError | null,
  options?: { action?: NonNullable<Parameters<typeof showErrorToast>[1]>['action'] },
): ResolvedError | null {
  if (!error) return null;
  const code = mapSupabaseAuthErrorCode(error);
  return showErrorToast(code, {
    action: options?.action,
  });
}
