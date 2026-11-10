const notFoundMiddleware = (_req, _res, next) => {
  const error = new Error('Route not found.');
  error.status = 404;
  error.code = 'ENDPOINT_NOT_FOUND';
  next(error);
};

export default notFoundMiddleware;
