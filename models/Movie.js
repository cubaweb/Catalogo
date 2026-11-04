const db = require('../config/database');
const AppError = require('../utils/AppError');

const GENRES = [
  'Acción',
  'Animación',
  'Aventura',
  'Ciencia ficción',
  'Comedia',
  'Crimen',
  'Documental',
  'Drama',
  'Fantasía',
  'Misterio',
  'Romance',
  'Suspenso',
  'Terror',
  'Otro'
];

const SORTS = {
  recent: { label: 'Agregadas recientemente', sql: 'm.created_at DESC' },
  title: { label: 'Título (A-Z)', sql: 'm.title ASC' },
  year: { label: 'Año (más nuevas primero)', sql: 'm.year DESC NULLS LAST' },
  rating: { label: 'Mejor puntuadas', sql: 'm.rating DESC NULLS LAST' }
};

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 48;
const MAX_PAGE = 100000;

const NOT_FOUND = 'No encontramos esa película';

function text(value) {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = String(value).trim();
  return trimmed === '' ? null : trimmed;
}

function number(value, parser) {
  const raw = text(value);
  if (raw === null) {
    return null;
  }
  const parsed = parser(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

class Movie {
  static normalize(data) {
    const rating = number(data.rating, Number.parseFloat);
    return {
      title: text(data.title),
      director: text(data.director),
      year: number(data.year, (v) => Number.parseInt(v, 10)),
      genre: text(data.genre),
      rating: rating === null ? null : Math.round(rating * 10) / 10,
      duration: number(data.duration, (v) => Number.parseInt(v, 10)),
      synopsis: text(data.synopsis),
      poster_url: text(data.poster_url)
    };
  }

  static normalizeFilters(query = {}) {
    const page = Math.min(Math.max(Number.parseInt(query.page, 10) || 1, 1), MAX_PAGE);
    const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || DEFAULT_LIMIT, 1), MAX_LIMIT);
    const q = typeof query.q === 'string' ? query.q.trim().slice(0, 100) : '';
    const genre = typeof query.genre === 'string' && GENRES.includes(query.genre) ? query.genre : '';
    const sort = typeof query.sort === 'string' && Object.hasOwn(SORTS, query.sort) ? query.sort : 'recent';
    return { page, limit, q, genre, sort };
  }

  static async list(user, query = {}) {
    const filters = Movie.normalizeFilters(query);
    const conditions = [];
    const params = [];

    if (user.role !== 'admin') {
      params.push(user.id);
      conditions.push(`m.user_id = $${params.length}`);
    }
    if (filters.q) {
      params.push(`%${filters.q.replace(/[\\%_]/g, '\\$&')}%`);
      conditions.push(`(m.title ILIKE $${params.length} OR m.director ILIKE $${params.length})`);
    }
    if (filters.genre) {
      params.push(filters.genre);
      conditions.push(`m.genre = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await db.query(`SELECT COUNT(*)::int AS total FROM movies m ${where}`, params);
    const total = countResult.rows[0].total;
    const pages = Math.max(1, Math.ceil(total / filters.limit));
    const page = Math.min(filters.page, pages);
    const offset = (page - 1) * filters.limit;

    const { rows } = await db.query(
      `SELECT m.*, u.name AS owner_name
       FROM movies m
       JOIN users u ON u.id = m.user_id
       ${where}
       ORDER BY ${SORTS[filters.sort].sql}, m.id DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, filters.limit, offset]
    );

    return { items: rows, total, page, pages, filters: { ...filters, page } };
  }

  static async findAuthorized(id, user) {
    const { rows } = await db.query(
      `SELECT m.*, u.name AS owner_name
       FROM movies m
       JOIN users u ON u.id = m.user_id
       WHERE m.id = $1`,
      [id]
    );
    const movie = rows[0];
    if (!movie || (user.role !== 'admin' && movie.user_id !== user.id)) {
      throw new AppError(404, NOT_FOUND);
    }
    return movie;
  }

  static async create(user, data) {
    const movie = Movie.normalize(data);
    const { rows } = await db.query(
      `INSERT INTO movies (user_id, title, director, year, genre, rating, duration, synopsis, poster_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        user.id,
        movie.title,
        movie.director,
        movie.year,
        movie.genre,
        movie.rating,
        movie.duration,
        movie.synopsis,
        movie.poster_url
      ]
    );
    return rows[0];
  }

  static async update(id, user, data) {
    await Movie.findAuthorized(id, user);
    const movie = Movie.normalize(data);
    const { rows } = await db.query(
      `UPDATE movies
       SET title = $1, director = $2, year = $3, genre = $4, rating = $5,
           duration = $6, synopsis = $7, poster_url = $8, updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [
        movie.title,
        movie.director,
        movie.year,
        movie.genre,
        movie.rating,
        movie.duration,
        movie.synopsis,
        movie.poster_url,
        id
      ]
    );
    return rows[0];
  }

  static async remove(id, user) {
    const movie = await Movie.findAuthorized(id, user);
    await db.query('DELETE FROM movies WHERE id = $1', [id]);
    return movie;
  }

  static async countByUser(userId) {
    const { rows } = await db.query('SELECT COUNT(*)::int AS total FROM movies WHERE user_id = $1', [userId]);
    return rows[0].total;
  }
}

Movie.GENRES = GENRES;
Movie.SORTS = SORTS;
Movie.DEFAULT_LIMIT = DEFAULT_LIMIT;

module.exports = Movie;
