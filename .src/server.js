// src/server.js - Entry Point
import app from './app.js';
import 'dotenv/config';

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const start = async () => {
  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`✅ Server running on port ${PORT} in ${NODE_ENV} mode`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

// Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await app.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await app.close();
  process.exit(0);
});
