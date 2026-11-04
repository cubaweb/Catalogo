const jwt = require('jsonwebtoken');
const config = require('../config');

const ALGORITHM = 'HS256';

function sign(user) {
  return jwt.sign({ role: user.role }, config.jwtSecret, {
    algorithm: ALGORITHM,
    subject: String(user.id),
    expiresIn: `${config.sessionHours}h`
  });
}

function verify(token) {
  return jwt.verify(token, config.jwtSecret, { algorithms: [ALGORITHM] });
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.isProd,
    maxAge: config.sessionHours * 60 * 60 * 1000
  };
}

module.exports = { sign, verify, cookieOptions };
