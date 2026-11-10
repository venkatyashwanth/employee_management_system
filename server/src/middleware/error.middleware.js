const errorMiddleware = (error, _req, res, _next) => {
  const isMalformedJson = error instanceof SyntaxError
    && error.status === 400
    && error.type === 'entity.parse.failed';
  const knownStatusCodes = {
    VALIDATION_ERROR: 400,
    EMPLOYEE_NOT_FOUND: 404,
    ENDPOINT_NOT_FOUND: 404,
    DUPLICATE_EMPLOYEE: 409,
    INVALID_DEPARTMENT: 400,
  };
  const statusCode = isMalformedJson
    ? 400
    : Object.prototype.hasOwnProperty.call(knownStatusCodes, error.code)
      ? knownStatusCodes[error.code]
      : 500;

  if (statusCode === 500) {
    console.error('Unhandled request error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
  }

  const knownMessages = {
    VALIDATION_ERROR: error.message,
    EMPLOYEE_NOT_FOUND: 'Employee not found.',
    ENDPOINT_NOT_FOUND: 'Route not found.',
    DUPLICATE_EMPLOYEE: error.message,
    INVALID_DEPARTMENT: error.message,
  };
  const message = isMalformedJson
    ? 'Malformed JSON request body.'
    : statusCode === 500
      ? 'Internal server error.'
      : Object.prototype.hasOwnProperty.call(knownMessages, error.code)
        ? knownMessages[error.code]
        : 'Request could not be completed.';

  res.status(statusCode).json({
    status: 'error',
    success: false,
    message,
    ...(error.errors && statusCode === 400 ? { errors: error.errors } : {}),
  });
};

export default errorMiddleware;
