export class AppError extends Error {
  constructor(message, options = {}) {
    const {
      code = 'APP_ERROR',
      statusCode = 500,
      details,
      expose = statusCode < 500,
      cause
    } = options;

    super(message, cause ? { cause } : undefined);

    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.expose = expose;
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', options = {}) {
    super(message, {
      code: 'BAD_REQUEST',
      statusCode: 400,
      ...options
    });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', options = {}) {
    super(message, {
      code: 'UNAUTHORIZED',
      statusCode: 401,
      ...options
    });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', options = {}) {
    super(message, {
      code: 'FORBIDDEN',
      statusCode: 403,
      ...options
    });
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', options = {}) {
    super(message, {
      code: 'NOT_FOUND',
      statusCode: 404,
      ...options
    });
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', options = {}) {
    super(message, {
      code: 'CONFLICT',
      statusCode: 409,
      ...options
    });
  }
}

export class BusinessRuleError extends AppError {
  constructor(message = 'Business Rule Violation', options = {}) {
    super(message, {
      code: 'BUSINESS_RULE_VIOLATION',
      statusCode: 422,
      ...options
    });
  }
}

export class IntegrationError extends AppError {
  constructor(message = 'External integration failed', options = {}) {
    super(message, {
      code: 'INTEGRATION_ERROR',
      statusCode: 502,
      expose: false,
      ...options
    });
  }
}

export function isAppError(error) {
  return error instanceof AppError;
}
