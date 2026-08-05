// src/server.js - Entry Point
import 'dotenv/config'; // 👈 Must be imported FIRST so environment variables load before app.js runs!
import app from './app.js';

const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

const start = async () => {
  try {
    const address = await app.listen({ port: PORT, host: HOST });
    console.log(`✅ Server running at ${address} in ${NODE_ENV} mode`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

// Graceful Shutdown
const shutdown = async (signal) => {
  console.log(`⚠️ ${signal} signal received: closing HTTP server`);
  try {
    await app.close();
    console.log('🔒 HTTP server closed cleanly');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during graceful shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
