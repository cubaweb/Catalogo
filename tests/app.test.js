process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'clave-de-pruebas-clave-de-pruebas-123456';

const request = require('supertest');
const app = require('../app');

describe('Aplicación', () => {
  test('GET /health responde ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('GET / muestra la portada a las visitas', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Cartelera');
    expect(res.text).toContain('Crear mi catálogo');
  });

  test('GET /auth/login muestra el formulario', async () => {
    const res = await request(app).get('/auth/login');
    expect(res.status).toBe(200);
    expect(res.text).toContain('name="email"');
    expect(res.text).toContain('name="password"');
  });

  test('GET /auth/register muestra el formulario', async () => {
    const res = await request(app).get('/auth/register');
    expect(res.status).toBe(200);
    expect(res.text).toContain('name="passwordConfirm"');
  });

  test('GET /movies sin sesión redirige al login', async () => {
    const res = await request(app).get('/movies');
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('/auth/login');
  });

  test('Un token inválido no da acceso a rutas privadas', async () => {
    const res = await request(app).get('/movies/new').set('Cookie', 'token=invalido');
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('/auth/login');
  });

  test('POST /auth/register con datos inválidos responde 422', async () => {
    const res = await request(app)
      .post('/auth/register')
      .type('form')
      .send({ name: '', email: 'no-es-correo', password: '123', passwordConfirm: '456' });
    expect(res.status).toBe(422);
    expect(res.text).toContain('Escribe un correo válido');
  });

  test('POST /auth/login sin datos responde 422', async () => {
    const res = await request(app).post('/auth/login').type('form').send({});
    expect(res.status).toBe(422);
    expect(res.text).toContain('Escribe tu contraseña');
  });

  test('Una ruta inexistente responde 404', async () => {
    const res = await request(app).get('/no-existe');
    expect(res.status).toBe(404);
    expect(res.text).toContain('La página que buscas no existe');
  });
});
