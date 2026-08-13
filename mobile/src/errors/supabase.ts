import type { AuthError } from '@supabase/supabase-js';

export function mapSupabaseAuthErrorCode(error: AuthError | null): string | null {
  if (!error) return null;

  const code = error.code;
  if (!code) return null;

  // Supabase returns codes like "invalid_credentials", "email_exists", etc.
  // Normalize to our auth/ namespace.
  const normalized = code
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

  return `auth/${normalized}`;
}
