const config = require('../config');
const AppError = require('../utils/AppError');

function notFound(req, res, next) {
  next(new AppError(404, 'La página que buscas no existe'));
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 600 ? err.status : 500;

  if (status >= 500) {
    console.error(err);
  }

  let message;
  if (err instanceof AppError) {
    message = err.message;
  } else if (status >= 500) {
    message = 'Ocurrió un error inesperado. Inténtalo de nuevo en unos minutos.';
  } else {
    message = 'No pudimos procesar la solicitud. Revisa los datos e inténtalo de nuevo.';
  }

  res.status(status).render('error', {
    title: `Error ${status}`,
    status,
    message,
    stack: config.isProd ? null : err.stack
  });
}

module.exports = { notFound, errorHandler };
