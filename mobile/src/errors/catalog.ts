export type ErrorSeverity = 'error' | 'warning' | 'success' | 'info';

export type ErrorPattern = 'inline' | 'toast' | 'modal';

export interface ErrorCatalogEntry {
  message: string;
  severity: ErrorSeverity;
  pattern: ErrorPattern;
  field?: string;
}

export const ERROR_CATALOG = {
  // Auth — Supabase error codes mapped to user-facing copy
  'auth/invalid_credentials': {
    message: 'Invalid email or password.',
    severity: 'error',
    pattern: 'toast',
  },
  'auth/user_not_found': {
    message: 'No account found with this email.',
    severity: 'error',
    pattern: 'toast',
  },
  'auth/email_exists': {
    message: 'An account with this email already exists.',
    severity: 'error',
    pattern: 'toast',
  },
  'auth/email_not_confirmed': {
    message: 'Please confirm your email before signing in.',
    severity: 'warning',
    pattern: 'toast',
  },
  'auth/weak_password': {
    message: 'Password is too weak. Please choose a stronger password.',
    severity: 'error',
    pattern: 'toast',
  },
  'auth/short_password': {
    message: 'Password must be at least {minLength} characters.',
    severity: 'error',
    pattern: 'toast',
  },
  'auth/session_expired': {
    message: 'Your session has expired. Please sign in again.',
    severity: 'error',
    pattern: 'toast',
  },
  'auth/otp_expired': {
    message: 'This link has expired. Please request a new one.',
    severity: 'error',
    pattern: 'toast',
  },
  'auth/validation_failed': {
    message: 'Please check the entered information and try again.',
    severity: 'error',
    pattern: 'toast',
  },
  'auth/rate_limit': {
    message: 'Too many attempts. Please wait a moment and try again.',
    severity: 'warning',
    pattern: 'toast',
  },

  // Generic
  'generic/network-error': {
    message: 'Connection failed. Please try again.',
    severity: 'error',
    pattern: 'toast',
  },
  'generic/unknown-error': {
    message: 'Something went wrong. Please try again.',
    severity: 'error',
    pattern: 'toast',
  },
  'generic/success': {
    message: 'Done.',
    severity: 'success',
    pattern: 'toast',
  },
} satisfies Record<string, ErrorCatalogEntry>;

export type ErrorCode = keyof typeof ERROR_CATALOG;

export const FALLBACK_ERROR_CODE = 'generic/unknown-error';
