import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Middleware to handle errors in a consistent way
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Log the full error internally
  logger.error('API error:', err);

  // Set appropriate status code and generic message
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err.name === 'ValidationError' || err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Resource Not Found';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Forbidden';
  }

  // Return only generic error info to client
  res.status(statusCode).json({
    error: message,
    // Do not expose internal error details
    timestamp: new Date().toISOString(),
  });
}

/**
 * Middleware to wrap async route handlers
 * This eliminates the need for try-catch blocks in every handler
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Custom error classes
 */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  details: any;
  
  constructor(message: string, details?: any) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}
