function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  console.error(error);
  const status = Number.isInteger(error.status) ? error.status : 500;
  return res.status(status).json({
    error: status === 500 ? 'Erro interno do servidor' : error.message,
  });
}

module.exports = errorHandler;
