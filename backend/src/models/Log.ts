import { BaseModel } from './BaseModel';
import { Log } from '../types';
import { query } from '../config/database';
import logger from '../config/logger';

export class LogModel extends BaseModel {
  protected tableName = 'logs';

  protected mapRow(row: any): Log {
    return {
      id: row.id,
      operation_id: row.operation_id,
      user_id: row.user_id,
      level: row.level,
      message: row.message,
      metadata: row.metadata,
      timestamp: row.timestamp,
    };
  }

  async findByOperationId(
    operationId: string,
    limit: number = 100,
    offset: number = 0,
  ): Promise<Log[]> {
    try {
      const result = await query(
        `SELECT * FROM ${this.tableName}
         WHERE operation_id = $1
         ORDER BY timestamp DESC
         LIMIT $2 OFFSET $3`,
        [operationId, limit, offset],
      );
      return result.rows.map((row) => this.mapRow(row));
    } catch (error) {
      logger.error('Error finding logs by operation:', error);
      throw error;
    }
  }

  async findByUserId(
    userId: string,
    limit: number = 100,
    offset: number = 0,
  ): Promise<Log[]> {
    try {
      const result = await query(
        `SELECT * FROM ${this.tableName}
         WHERE user_id = $1
         ORDER BY timestamp DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset],
      );
      return result.rows.map((row) => this.mapRow(row));
    } catch (error) {
      logger.error('Error finding logs by user:', error);
      throw error;
    }
  }

  async findByLevel(
    level: string,
    limit: number = 100,
    offset: number = 0,
  ): Promise<Log[]> {
    try {
      const result = await query(
        `SELECT * FROM ${this.tableName}
         WHERE level = $1
         ORDER BY timestamp DESC
         LIMIT $2 OFFSET $3`,
        [level, limit, offset],
      );
      return result.rows.map((row) => this.mapRow(row));
    } catch (error) {
      logger.error('Error finding logs by level:', error);
      throw error;
    }
  }

  async addLog(
    level: string,
    message: string,
    operationId?: string,
    userId?: string,
    metadata?: Record<string, any>,
  ): Promise<Log> {
    try {
      const result = await query(
        `INSERT INTO ${this.tableName}
         (level, message, operation_id, user_id, metadata)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [level, message, operationId, userId, JSON.stringify(metadata || {})],
      );
      return this.mapRow(result.rows[0]);
    } catch (error) {
      logger.error('Error adding log:', error);
      throw error;
    }
  }

  async deleteByOperationId(operationId: string): Promise<number> {
    try {
      const result = await query(
        `DELETE FROM ${this.tableName} WHERE operation_id = $1`,
        [operationId],
      );
      return result.rowCount || 0;
    } catch (error) {
      logger.error('Error deleting logs:', error);
      throw error;
    }
  }

  async clearOldLogs(daysOld: number = 30): Promise<number> {
    try {
      const result = await query(
        `DELETE FROM ${this.tableName}
         WHERE timestamp < NOW() - INTERVAL '${daysOld} days'`,
      );
      return result.rowCount || 0;
    } catch (error) {
      logger.error('Error clearing old logs:', error);
      throw error;
    }
  }
}

export const logModel = new LogModel();
