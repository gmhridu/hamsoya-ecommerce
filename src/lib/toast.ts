import { toast as sonner } from 'sonner';
import { ErrorCode, ErrorMessages } from './errors';

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

// Default duration for toasts
const DEFAULT_DURATION = 5000;

// Success toast
export function successToast(message: string, options?: { description?: string; id?: string | number }) {
  return sonner.success(message, {
    description: options?.description,
    duration: DEFAULT_DURATION,
    id: options?.id,
  });
}

// Error toast
export function errorToast(message: string, options?: { description?: string; duration?: number; id?: string | number }) {
  return sonner.error(message, {
    description: options?.description,
    duration: options?.duration || DEFAULT_DURATION,
    id: options?.id,
  });
}

// Warning toast
export function warningToast(message: string, options?: { description?: string; id?: string | number }) {
  return sonner.warning(message, {
    description: options?.description,
    duration: DEFAULT_DURATION,
    id: options?.id,
  });
}

// Info toast
export function infoToast(message: string, options?: { description?: string; id?: string | number }) {
  return sonner.info(message, {
    description: options?.description,
    duration: DEFAULT_DURATION,
    id: options?.id,
  });
}

// Loading toast
export function loadingToast(message: string, options?: { id?: string | number }) {
  return sonner.loading(message, {
    id: options?.id,
  });
}

// Dismiss all toasts
export function dismissAllToasts() {
  sonner.dismiss();
}

// Handle API errors from tRPC or other sources
export function handleApiError(error: unknown, fallbackMessage = 'An error occurred'): string {
  let message = fallbackMessage;
  let description: string | undefined;

  // Handle ErrorCode
  if (error && typeof error === 'object' && 'message' in error) {
    const errorMessage = (error as { message: string }).message;

    // Check if it's a known error code
    const knownErrorCode = Object.values(ErrorCode).find(
      (code) => ErrorMessages[code] === errorMessage
    );

    if (knownErrorCode) {
      message = ErrorMessages[knownErrorCode];
    } else {
      // Use the error message directly if it's meaningful
      if (errorMessage && !errorMessage.includes('【')) {
        message = errorMessage;
      }
    }
  }

  // Handle Error objects
  if (error instanceof Error) {
    // Use the error message if it's not too technical
    if (!error.message.includes('【') && !error.message.startsWith('[')) {
      message = error.message;
    }
  }

  errorToast(message, { description });
  return message;
}

// Format validation errors for toast
export function formatValidationErrors(errors: Record<string, string[]>): string[] {
  const messages: string[] = [];

  for (const [field, fieldErrors] of Object.entries(errors)) {
    for (const error of fieldErrors) {
      // Make field name more readable
      const readableField = field
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase());

      messages.push(`${readableField}: ${error}`);
    }
  }

  return messages;
}

// Show validation errors as toasts
export function showValidationErrors(errors: Record<string, string[]>): void {
  const messages = formatValidationErrors(errors);

  if (messages.length > 0) {
    // Show first error as main toast
    errorToast(messages[0], {
      description: messages.length > 1
        ? `And ${messages.length - 1} more errors`
        : undefined,
    });
  }
}

// Aliases for backward compatibility
export const toast = {
  success: successToast,
  error: errorToast,
  warning: warningToast,
  info: infoToast,
  loading: loadingToast,
  dismiss: dismissAllToasts,
};

export default toast;
