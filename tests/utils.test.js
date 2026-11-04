process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'clave-de-pruebas-clave-de-pruebas-123456';

const Movie = require('../models/Movie');
const queryString = require('../utils/queryString');
const { sign, verify } = require('../utils/token');

describe('Token JWT', () => {
  test('firma y verifica un token con el rol del usuario', () => {
    const token = sign({ id: 7, role: 'admin' });
    const payload = verify(token);
    expect(payload.sub).toBe('7');
    expect(payload.role).toBe('admin');
  });

  test('rechaza un token manipulado', () => {
    const token = sign({ id: 7, role: 'user' });
    expect(() => verify(`${token}x`)).toThrow();
  });
});

describe('Filtros del catálogo', () => {
  test('usa valores por defecto', () => {
    expect(Movie.normalizeFilters({})).toEqual({
      page: 1,
      limit: Movie.DEFAULT_LIMIT,
      q: '',
      genre: '',
      sort: 'recent'
    });
  });

  test('limita página y cantidad por página', () => {
    const filters = Movie.normalizeFilters({ page: '-4', limit: '999' });
    expect(filters.page).toBe(1);
    expect(filters.limit).toBe(48);
  });

  test('ignora géneros y órdenes desconocidos', () => {
    const filters = Movie.normalizeFilters({ genre: 'Inventado', sort: 'DROP TABLE' });
    expect(filters.genre).toBe('');
    expect(filters.sort).toBe('recent');
  });
});

describe('Normalización de datos de película', () => {
  test('convierte textos vacíos en null y números en valores válidos', () => {
    const movie = Movie.normalize({
      title: '  Coco ',
      director: '',
      year: '2017',
      rating: '8.45',
      duration: '',
      synopsis: '   ',
      poster_url: ''
    });
    expect(movie.title).toBe('Coco');
    expect(movie.director).toBeNull();
    expect(movie.year).toBe(2017);
    expect(movie.rating).toBe(8.5);
    expect(movie.duration).toBeNull();
    expect(movie.synopsis).toBeNull();
    expect(movie.poster_url).toBeNull();
  });
});

describe('queryString', () => {
  test('omite valores vacíos', () => {
    expect(queryString({ q: 'coco', genre: '', page: 2 })).toBe('?q=coco&page=2');
    expect(queryString({ q: '', page: '' })).toBe('');
  });
});
