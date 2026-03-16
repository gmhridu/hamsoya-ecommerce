// Standardized API Error Types
export enum ErrorCode {
  // Authentication errors (401)
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // Authorization errors (403)
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Validation errors (400, 422)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Resource errors (404)
  NOT_FOUND = 'NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',

  // Conflict errors (409)
  CONFLICT = 'CONFLICT',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',

  // Rate limiting (429)
  RATE_LIMITED = 'RATE_LIMITED',

  // Server errors (500)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}

// HTTP Status Codes mapping
export const ErrorStatusMap: Record<ErrorCode, number> = {
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.INVALID_TOKEN]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 403,
  [ErrorCode.VALIDATION_ERROR]: 422,
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.USER_NOT_FOUND]: 404,
  [ErrorCode.RESOURCE_NOT_FOUND]: 404,
  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.USER_ALREADY_EXISTS]: 409,
  [ErrorCode.EMAIL_ALREADY_EXISTS]: 409,
  [ErrorCode.RATE_LIMITED]: 429,
  [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 503,
};

// User-friendly error messages
export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.UNAUTHORIZED]: 'You need to be logged in to perform this action.',
  [ErrorCode.INVALID_TOKEN]: 'Your session is invalid. Please log in again.',
  [ErrorCode.TOKEN_EXPIRED]: 'Your session has expired. Please log in again.',
  [ErrorCode.FORBIDDEN]: 'You do not have permission to perform this action.',
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 'You do not have the required permissions.',
  [ErrorCode.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorCode.INVALID_INPUT]: 'The information you provided is invalid.',
  [ErrorCode.NOT_FOUND]: 'The requested resource could not be found.',
  [ErrorCode.USER_NOT_FOUND]: 'We could not find your account.',
  [ErrorCode.RESOURCE_NOT_FOUND]: 'The requested item could not be found.',
  [ErrorCode.CONFLICT]: 'A conflict occurred with the current state of the resource.',
  [ErrorCode.USER_ALREADY_EXISTS]: 'An account with this information already exists.',
  [ErrorCode.EMAIL_ALREADY_EXISTS]: 'An account with this email already exists.',
  [ErrorCode.RATE_LIMITED]: 'Too many requests. Please wait a moment and try again.',
  [ErrorCode.INTERNAL_SERVER_ERROR]: 'Something went wrong. Please try again later.',
  [ErrorCode.DATABASE_ERROR]: 'Unable to save your information. Please try again.',
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 'A service is temporarily unavailable. Please try again.',
};

// API Error Response Format
export interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, string[]>;
    timestamp: string;
    path?: string;
  };
}

// API Success Response Format
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// Create API Error
export function createApiError(
  code: ErrorCode,
  details?: Record<string, string[]>,
  customMessage?: string
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message: customMessage || ErrorMessages[code],
      details,
      timestamp: new Date().toISOString(),
    },
  };
}

// Create API Success
export function createApiSuccess<T>(data: T, message?: string): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

// Error class for throwing errors in services
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message?: string,
    public details?: Record<string, string[]>
  ) {
    super(message || ErrorMessages[code]);
    this.name = 'AppError';
  }
}

// Check if error is an AppError
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

// Extract error code from unknown error
export function getErrorCode(error: unknown): ErrorCode {
  if (isAppError(error)) {
    return error.code;
  }
  return ErrorCode.INTERNAL_SERVER_ERROR;
}
