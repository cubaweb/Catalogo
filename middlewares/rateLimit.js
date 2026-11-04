const rateLimit = require('express-rate-limit');
const config = require('../config');
const AppError = require('../utils/AppError');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => config.isTest,
  handler: (req, res, next) => {
    next(new AppError(429, 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.'));
  }
});

module.exports = { authLimiter };
