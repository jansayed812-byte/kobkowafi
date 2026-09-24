import { Pool, Client } from 'pg';
import { config } from './env';
import logger from './logger';

const poolConfig = {
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  ssl: config.db.ssl ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
});

export async function initializeDatabase(): Promise<void> {
  try {
    const client = await pool.connect();
    logger.info('✅ Connected to PostgreSQL database');
    client.release();
  } catch (error) {
    logger.error('❌ Failed to connect to PostgreSQL database:', error);
    throw error;
  }
}

export async function query(text: string, params?: any[]): Promise<any> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug(`Query executed in ${duration}ms: ${text.substring(0, 50)}...`);
    return result;
  } catch (error) {
    logger.error('Database query error:', error);
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  await pool.end();
  logger.info('Database connection pool closed');
}
