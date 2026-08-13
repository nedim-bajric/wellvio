import { toast as sonnerToast, type ToastAction } from 'sonner-native';
import { resolveError, type ResolvedError } from './resolveError';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ShowToastOptions {
  message?: string;
  type?: ToastType;
  action?: ToastAction;
  duration?: number;
}

export function showToast(options: ShowToastOptions): void {
  const { message, type = 'info', action, duration } = options;
  const data = { action, duration };
  switch (type) {
    case 'success':
      sonnerToast.success(message ?? '', data);
      break;
    case 'error':
      sonnerToast.error(message ?? '', data);
      break;
    case 'warning':
      sonnerToast.warning(message ?? '', data);
      break;
    case 'info':
    default:
      sonnerToast.info(message ?? '', data);
      break;
  }
}

export function showErrorToast(
  code: string | undefined | null,
  options?: {
    action?: ToastAction;
    fallbackMessage?: string;
    overrides?: Partial<ResolvedError>;
  },
): ResolvedError {
  const resolved = resolveError(code, {
    overrides:
      options?.fallbackMessage && !options?.overrides?.message
        ? { message: options.fallbackMessage }
        : options?.overrides,
  });
  const data = { action: options?.action };
  switch (resolved.severity) {
    case 'success':
      sonnerToast.success(resolved.message, data);
      break;
    case 'warning':
      sonnerToast.warning(resolved.message, data);
      break;
    case 'info':
      sonnerToast.info(resolved.message, data);
      break;
    case 'error':
    default:
      sonnerToast.error(resolved.message, data);
      break;
  }
  return resolved;
}

export function showSuccessToast(message: string): void {
  sonnerToast.success(message);
}

export function showInfoToast(message: string): void {
  sonnerToast.info(message);
}
