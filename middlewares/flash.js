const config = require('../config');

const COOKIE_NAME = 'flash';
const TYPES = ['success', 'danger', 'warning', 'info'];

function readMessages(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter((item) => item && TYPES.includes(item.type) && typeof item.text === 'string')
      .slice(0, 5);
  } catch {
    return [];
  }
}

function flash(req, res, next) {
  const raw = req.cookies && req.cookies[COOKIE_NAME];
  res.locals.flash = raw ? readMessages(raw) : [];
  if (raw) {
    res.clearCookie(COOKIE_NAME);
  }

  const queued = [];
  req.flash = (type, text) => {
    queued.push({ type, text });
    res.cookie(COOKIE_NAME, JSON.stringify(queued), {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.isProd,
      maxAge: 60 * 1000
    });
  };

  next();
}

module.exports = flash;
