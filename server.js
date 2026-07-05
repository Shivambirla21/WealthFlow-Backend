import app from './app.js';
import { env } from './config/envConfig.js';
import { connectDatabase, pool } from './config/database.js';

function getDatabaseHost() {
  try {
    return env.databaseUrl ? new URL(env.databaseUrl).host : 'not configured';
  } catch {
    return 'invalid DATABASE_URL';
  }
}

function logStartup(databaseStatus) {
  const baseUrl = `http://localhost:${env.port}`;

  console.log('');
  console.log('========================================');
  console.log(' WealthFlow Backend Server');
  console.log('========================================');
  console.log(` Environment : ${env.nodeEnv}`);
  console.log(` Port        : ${env.port}`);
  console.log(` API Base    : ${baseUrl}/api`);
  console.log(` Health      : ${baseUrl}/api/health`);
  console.log(` CORS Origin : ${env.corsOrigin || 'not set'}`);
  console.log(` DB Host     : ${getDatabaseHost()}`);

  if (databaseStatus?.connected) {
    console.log(` Database    : connected (${databaseStatus.database})`);
    console.log(` DB User     : ${databaseStatus.user}`);
  } else {
    console.log(` Database    : not connected (${databaseStatus?.message || 'unknown'})`);
  }

  console.log('========================================');
  console.log('');
}

async function start() {
  try {
    const dbStatus = await connectDatabase();

    const server = app.listen(env.port, () => logStartup(dbStatus));

    const graceful = async (signal) => {
      console.log(`${signal} received, shutting down...`);
      server.close(async () => {
        if (pool) await pool.end();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => graceful('SIGINT'));
    process.on('SIGTERM', () => graceful('SIGTERM'));
    process.on('unhandledRejection', (reason) => {
      console.error('UnhandledRejection:', reason);
      graceful('unhandledRejection');
    });
    process.on('uncaughtException', (err) => {
      console.error('UncaughtException:', err);
      process.exit(1);
    });

  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
