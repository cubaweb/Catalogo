const { validationResult } = require('express-validator');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { sign, cookieOptions } = require('../utils/token');

const DEFAULT_REDIRECT = '/movies';

function safeRedirect(value) {
  if (typeof value !== 'string') {
    return DEFAULT_REDIRECT;
  }
  const valid = value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\');
  return valid ? value : DEFAULT_REDIRECT;
}

function messages(req) {
  return validationResult(req)
    .array({ onlyFirstError: true })
    .map((error) => error.msg);
}

function startSession(res, user) {
  res.cookie('token', sign(user), cookieOptions());
}

exports.showLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Entrar',
    errors: [],
    values: {},
    redirectTo: req.query.redirectTo ? safeRedirect(req.query.redirectTo) : ''
  });
};

exports.login = async (req, res) => {
  const { email = '', redirectTo = '' } = req.body;
  const errors = messages(req);

  if (errors.length) {
    return res.status(422).render('auth/login', { title: 'Entrar', errors, values: { email }, redirectTo });
  }

  try {
    const user = await User.authenticate(req.body.email, req.body.password);
    startSession(res, user);
    req.flash('success', `Hola, ${user.name}`);
    res.redirect(safeRedirect(redirectTo));
  } catch (err) {
    if (err instanceof AppError && err.status === 401) {
      return res
        .status(401)
        .render('auth/login', { title: 'Entrar', errors: [err.message], values: { email }, redirectTo });
    }
    throw err;
  }
};

exports.showRegister = (req, res) => {
  res.render('auth/register', { title: 'Crear cuenta', errors: [], values: {} });
};

exports.register = async (req, res) => {
  const { name = '', email = '' } = req.body;
  const errors = messages(req);

  if (errors.length) {
    return res.status(422).render('auth/register', { title: 'Crear cuenta', errors, values: { name, email } });
  }

  try {
    const user = await User.create({ name: req.body.name, email: req.body.email, password: req.body.password });
    startSession(res, user);
    req.flash('success', 'Tu cuenta está lista. Agrega tu primera película.');
    res.redirect(DEFAULT_REDIRECT);
  } catch (err) {
    if (err instanceof AppError && err.status === 409) {
      return res
        .status(409)
        .render('auth/register', { title: 'Crear cuenta', errors: [err.message], values: { name, email } });
    }
    throw err;
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  req.flash('info', 'Cerraste sesión');
  res.redirect('/');
};
