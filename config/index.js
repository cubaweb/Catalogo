require('dotenv').config();

const env = process.env;
const sessionHours = Number(env.SESSION_HOURS) > 0 ? Number(env.SESSION_HOURS) : 24;

const config = {
  env: env.NODE_ENV || 'development',
  isProd: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  port: Number(env.PORT) || 3000,
  databaseUrl: env.DATABASE_URL,
  dbSsl: env.DB_SSL !== 'false',
  jwtSecret: env.JWT_SECRET,
  sessionHours,
  adminName: env.ADMIN_NAME || 'Administrador',
  adminEmail: env.ADMIN_EMAIL ? env.ADMIN_EMAIL.trim().toLowerCase() : null,
  adminPassword: env.ADMIN_PASSWORD || null
};

config.assertReady = () => {
  const missing = ['DATABASE_URL', 'JWT_SECRET'].filter((key) => !env[key]);
  if (missing.length) {
    throw new Error(`Faltan variables de entorno: ${missing.join(', ')}`);
  }
  if (config.isProd && env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres en producción');
  }
};

module.exports = config;
