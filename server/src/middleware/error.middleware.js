const errorMiddleware = (error, _req, res, _next) => {
  const statusCode = Number.isInteger(error.status) && error.status >= 400 && error.status < 600
    ? error.status
    : 500;

  if (statusCode === 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    status: 'error',
    message: statusCode === 500 ? 'Internal server error.' : error.message,
  });
};

export default errorMiddleware;
