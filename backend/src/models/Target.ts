import { BaseModel } from './BaseModel';
import { Target } from '../types';
import { query } from '../config/database';
import logger from '../config/logger';

export class TargetModel extends BaseModel {
  protected tableName = 'targets';

  protected mapRow(row: any): Target {
    return {
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      protocol: row.protocol,
      host: row.host,
      port: row.port,
      username: row.username,
      metadata: row.metadata,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  async findByUserId(
    userId: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<Target[]> {
    try {
      const result = await query(
        `SELECT * FROM ${this.tableName}
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset],
      );
      return result.rows.map((row) => this.mapRow(row));
    } catch (error) {
      logger.error('Error finding targets by user:', error);
      throw error;
    }
  }

  async countByUserId(userId: string): Promise<number> {
    try {
      const result = await query(
        `SELECT COUNT(*) as count FROM ${this.tableName} WHERE user_id = $1`,
        [userId],
      );
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      logger.error('Error counting targets:', error);
      throw error;
    }
  }

  async findByProtocol(userId: string, protocol: string): Promise<Target[]> {
    try {
      const result = await query(
        `SELECT * FROM ${this.tableName}
         WHERE user_id = $1 AND protocol = $2
         ORDER BY created_at DESC`,
        [userId, protocol],
      );
      return result.rows.map((row) => this.mapRow(row));
    } catch (error) {
      logger.error('Error finding targets by protocol:', error);
      throw error;
    }
  }

  async createTarget(
    userId: string,
    name: string,
    protocol: string,
    host: string,
    port?: number,
    username?: string,
    metadata?: Record<string, any>,
  ): Promise<Target> {
    try {
      const result = await query(
        `INSERT INTO ${this.tableName}
         (user_id, name, protocol, host, port, username, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [userId, name, protocol, host, port, username, JSON.stringify(metadata || {})],
      );
      return this.mapRow(result.rows[0]);
    } catch (error) {
      logger.error('Error creating target:', error);
      throw error;
    }
  }

  async updateTarget(
    targetId: string,
    updates: Partial<Omit<Target, 'id' | 'created_at' | 'updated_at'>>,
  ): Promise<Target | null> {
    try {
      const columns = Object.keys(updates);
      const values = Object.values(updates);
      const setClause = columns.map((col, i) => {
        if (col === 'metadata') {
          return `${col} = $${i + 1}::jsonb`;
        }
        return `${col} = $${i + 1}`;
      }).join(', ');

      const result = await query(
        `UPDATE ${this.tableName}
         SET ${setClause}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${columns.length + 1}
         RETURNING *`,
        [...values, targetId],
      );
      return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
    } catch (error) {
      logger.error('Error updating target:', error);
      throw error;
    }
  }
}

export const targetModel = new TargetModel();
