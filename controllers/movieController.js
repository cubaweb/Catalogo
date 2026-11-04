const { validationResult } = require('express-validator');
const Movie = require('../models/Movie');
const queryString = require('../utils/queryString');

function messages(req) {
  return validationResult(req)
    .array({ onlyFirstError: true })
    .map((error) => error.msg);
}

function formView(overrides) {
  return { genres: Movie.GENRES, errors: [], ...overrides };
}

exports.index = async (req, res) => {
  const result = await Movie.list(req.user, req.query);
  const { filters } = result;

  const pageUrl = (page) =>
    queryString({
      q: filters.q,
      genre: filters.genre,
      sort: filters.sort === 'recent' ? '' : filters.sort,
      limit: filters.limit === Movie.DEFAULT_LIMIT ? '' : filters.limit,
      page: page > 1 ? page : ''
    });

  res.render('movies/index', {
    title: req.user.role === 'admin' ? 'Todas las películas' : 'Mi catálogo',
    result,
    filters,
    genres: Movie.GENRES,
    sorts: Movie.SORTS,
    hasFilters: Boolean(filters.q || filters.genre),
    isAdmin: req.user.role === 'admin',
    pageUrl
  });
};

exports.newForm = (req, res) => {
  res.render(
    'movies/form',
    formView({
      title: 'Agregar película',
      heading: 'Agregar película',
      action: '/movies',
      submitLabel: 'Guardar película',
      cancelUrl: '/movies',
      values: {}
    })
  );
};

exports.create = async (req, res) => {
  const errors = messages(req);
  if (errors.length) {
    return res.status(422).render(
      'movies/form',
      formView({
        title: 'Agregar película',
        heading: 'Agregar película',
        action: '/movies',
        submitLabel: 'Guardar película',
        cancelUrl: '/movies',
        values: req.body,
        errors
      })
    );
  }

  const movie = await Movie.create(req.user, req.body);
  req.flash('success', `«${movie.title}» se agregó a tu catálogo`);
  res.redirect(`/movies/${movie.id}`);
};

exports.show = async (req, res) => {
  const movie = await Movie.findAuthorized(Number(req.params.id), req.user);
  res.render('movies/show', {
    title: movie.title,
    movie,
    isAdmin: req.user.role === 'admin'
  });
};

exports.editForm = async (req, res) => {
  const movie = await Movie.findAuthorized(Number(req.params.id), req.user);
  res.render(
    'movies/form',
    formView({
      title: `Editar ${movie.title}`,
      heading: 'Editar película',
      action: `/movies/${movie.id}?_method=PUT`,
      submitLabel: 'Guardar cambios',
      cancelUrl: `/movies/${movie.id}`,
      values: movie
    })
  );
};

exports.update = async (req, res) => {
  const id = Number(req.params.id);
  const errors = messages(req);
  if (errors.length) {
    return res.status(422).render(
      'movies/form',
      formView({
        title: 'Editar película',
        heading: 'Editar película',
        action: `/movies/${id}?_method=PUT`,
        submitLabel: 'Guardar cambios',
        cancelUrl: `/movies/${id}`,
        values: req.body,
        errors
      })
    );
  }

  const movie = await Movie.update(id, req.user, req.body);
  req.flash('success', `«${movie.title}» se actualizó`);
  res.redirect(`/movies/${movie.id}`);
};

exports.destroy = async (req, res) => {
  const movie = await Movie.remove(Number(req.params.id), req.user);
  req.flash('success', `«${movie.title}» se eliminó del catálogo`);
  res.redirect('/movies');
};
