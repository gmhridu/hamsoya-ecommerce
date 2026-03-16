import { z } from 'zod';

// Field-friendly error message mapping
const fieldErrorMessages: Record<string, Record<string, string>> = {
  // Common fields
  email: {
    invalid: 'Please enter a valid email address',
    empty: 'Email is required',
  },
  password: {
    too_small: 'Password must be at least 8 characters',
    too_big: 'Password must be less than 255 characters',
    empty: 'Password is required',
  },
  name: {
    too_small: 'Name must be at least 2 characters',
    too_big: 'Name must be less than 255 characters',
    empty: 'Name is required',
  },
  phoneNumber: {
    too_big: 'Phone number must be less than 20 characters',
    invalid: 'Please enter a valid phone number',
  },
  profileImageUrl: {
    invalid: 'Please enter a valid image URL',
  },
  token: {
    invalid: 'Invalid token',
    empty: 'Token is required',
  },
  otp: {
    invalid: 'Please enter a valid 6-digit code',
    too_small: 'Verification code must be 6 digits',
    too_big: 'Verification code must be 6 digits',
    empty: 'Verification code is required',
  },
};

// Get user-friendly error message for a field
export function getFieldErrorMessage(field: string, errorKind: string): string {
  const fieldMessages = fieldErrorMessages[field];
  if (fieldMessages && fieldMessages[errorKind]) {
    return fieldMessages[errorKind];
  }

  // Default messages based on error kind
  const defaultMessages: Record<string, string> = {
    invalid_type: 'Invalid value provided',
    too_small: 'Value is too short',
    too_big: 'Value is too long',
    enum: 'Invalid option selected',
    empty: 'This field is required',
    invalid: 'Invalid value provided',
  };

  return defaultMessages[errorKind] || 'Invalid value provided';
}

// Format Zod validation errors into user-friendly format
export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const formattedErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.');

    if (!formattedErrors[path]) {
      formattedErrors[path] = [];
    }

    let message: string;

    // Handle different error types using Zod v4 string codes
    const code = issue.code;

    if (code === 'too_small') {
      message = getFieldErrorMessage(path, 'too_small');
    } else if (code === 'too_big') {
      message = getFieldErrorMessage(path, 'too_big');
    } else if (code === 'invalid_type') {
      message = getFieldErrorMessage(path, 'empty');
    } else if (code === 'invalid_format') {
      message = getFieldErrorMessage(path, 'invalid');
    } else if (code === 'invalid_value') {
      message = getFieldErrorMessage(path, 'enum');
    } else if (code === 'custom') {
      message = issue.message || getFieldErrorMessage(path, 'invalid');
    } else {
      message = getFieldErrorMessage(path, 'invalid');
    }

    // Add unique messages only
    if (!formattedErrors[path].includes(message)) {
      formattedErrors[path].push(message);
    }
  }

  return formattedErrors;
}

// Get first error message for a field
export function getFirstError(errors: Record<string, string[]>, field: string): string | undefined {
  const fieldErrors = errors[field];
  return fieldErrors?.[0];
}

// Get all error messages as a single string
export function getAllErrorMessages(errors: Record<string, string[]>): string[] {
  const messages: string[] = [];

  for (const fieldErrors of Object.values(errors)) {
    messages.push(...fieldErrors);
  }

  return messages;
}

// Check if there are any errors
export function hasErrors(errors: Record<string, string[]>): boolean {
  return Object.keys(errors).length > 0;
}
