const config = require('./config');

config.assertReady();

const app = require('./app');
const db = require('./config/database');
const { initDatabase } = require('./config/init');

async function start() {
  await initDatabase();

  const server = app.listen(config.port, () => {
    console.log(`Servidor escuchando en el puerto ${config.port} (${config.env})`);
  });

  const shutdown = () => {
    server.close(async () => {
      await db.pool.end();
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start().catch((err) => {
  console.error('No se pudo iniciar la aplicación:', err);
  process.exit(1);
});
