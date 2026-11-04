const User = require('../models/User');
const AppError = require('../utils/AppError');
const { verify } = require('../utils/token');

async function authenticate(req, res, next) {
  req.user = null;
  res.locals.currentUser = null;

  const token = req.cookies && req.cookies.token;
  if (!token) {
    return next();
  }

  let payload;
  try {
    payload = verify(token);
  } catch {
    res.clearCookie('token');
    return next();
  }

  const user = await User.findById(Number(payload.sub));
  if (user) {
    req.user = user;
    res.locals.currentUser = user;
  } else {
    res.clearCookie('token');
  }
  next();
}

function requireAuth(req, res, next) {
  if (req.user) {
    return next();
  }
  req.flash('warning', 'Inicia sesión para continuar');
  const target = encodeURIComponent(req.originalUrl);
  res.redirect(`/auth/login?redirectTo=${target}`);
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return requireAuth(req, res, next);
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'No tienes permiso para ver esta página'));
    }
    next();
  };
}

function guestOnly(req, res, next) {
  if (req.user) {
    return res.redirect('/movies');
  }
  next();
}

module.exports = { authenticate, requireAuth, requireRole, guestOnly };
