const { body } = require('express-validator');
const AppError = require('../utils/AppError');
const Movie = require('../models/Movie');

const MAX_ID = 2147483647;

function movieId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1 || id > MAX_ID) {
    return next(new AppError(404, 'No encontramos esa película'));
  }
  next();
}

const register = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('El nombre debe tener entre 2 y 80 caracteres'),
  body('email')
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Escribe un correo válido')
    .bail()
    .isLength({ max: 160 })
    .withMessage('El correo es demasiado largo'),
  body('password')
    .isLength({ min: 8, max: 72 })
    .withMessage('La contraseña debe tener entre 8 y 72 caracteres')
    .bail()
    .matches(/[A-Za-z]/)
    .withMessage('La contraseña debe incluir al menos una letra')
    .matches(/\d/)
    .withMessage('La contraseña debe incluir al menos un número'),
  body('passwordConfirm')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Las contraseñas no coinciden')
];

const login = [
  body('email').trim().toLowerCase().isEmail().withMessage('Escribe un correo válido'),
  body('password').notEmpty().withMessage('Escribe tu contraseña')
];

const maxYear = new Date().getFullYear() + 5;

const movie = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('El título es obligatorio')
    .bail()
    .isLength({ max: 150 })
    .withMessage('El título no puede superar 150 caracteres'),
  body('director')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 100 })
    .withMessage('El director no puede superar 100 caracteres'),
  body('year')
    .optional({ values: 'falsy' })
    .isInt({ min: 1888, max: maxYear })
    .withMessage(`El año debe estar entre 1888 y ${maxYear}`),
  body('genre')
    .optional({ values: 'falsy' })
    .isIn(Movie.GENRES)
    .withMessage('Elige un género de la lista'),
  body('rating')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0, max: 10 })
    .withMessage('La puntuación debe estar entre 0 y 10'),
  body('duration')
    .optional({ values: 'falsy' })
    .isInt({ min: 1, max: 1000 })
    .withMessage('La duración debe estar entre 1 y 1000 minutos'),
  body('synopsis')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('La sinopsis no puede superar 2000 caracteres'),
  body('poster_url')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 })
    .withMessage('El enlace del póster no puede superar 500 caracteres')
    .bail()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('El enlace del póster debe empezar con http:// o https://')
];

module.exports = { movieId, register, login, movie };
