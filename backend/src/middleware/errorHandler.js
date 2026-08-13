export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  if (statusCode >= 500) {
    console.error('[error]', err);
  }
  res.status(statusCode).json({
    error: err.name === 'ValidationError' ? err.message : statusCode >= 500 ? 'Internal server error' : err.message,
  });
}
