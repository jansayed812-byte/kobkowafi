import app from './app';
import { config } from './config/env';
import logger from './config/logger';
import { initializeDatabase } from './config/database';

const PORT = config.port;
const HOST = config.host;

async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();

    const server = app.listen(PORT, HOST, () => {
      logger.info(`🚀 Server is running at http://${HOST}:${PORT}`);
      logger.info(`📝 API Prefix: ${config.api.prefix}`);
      logger.info(`🔧 Environment: ${config.nodeEnv}`);
      logger.info(`🗄️  Database: ${config.db.host}:${config.db.port}/${config.db.database}`);
      logger.info(`📍 Redis: ${config.redis.host}:${config.redis.port}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection at:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error: any) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();
