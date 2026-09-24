import { BaseModel } from './BaseModel';
import { Operation } from '../types';
import { query } from '../config/database';
import logger from '../config/logger';

export class OperationModel extends BaseModel {
  protected tableName = 'operations';

  protected mapRow(row: any): Operation {
    return {
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      description: row.description,
      target: row.target,
      type: row.type,
      status: row.status,
      progress: row.progress,
      total_attempts: row.total_attempts,
      successful_attempts: row.successful_attempts,
      failed_attempts: row.failed_attempts,
      started_at: row.started_at,
      completed_at: row.completed_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  async findByUserId(
    userId: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<Operation[]> {
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
      logger.error('Error finding operations by user:', error);
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
      logger.error('Error counting operations:', error);
      throw error;
    }
  }

  async findByStatus(status: string, limit: number = 10): Promise<Operation[]> {
    try {
      const result = await query(
        `SELECT * FROM ${this.tableName}
         WHERE status = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [status, limit],
      );
      return result.rows.map((row) => this.mapRow(row));
    } catch (error) {
      logger.error('Error finding operations by status:', error);
      throw error;
    }
  }

  async updateStatus(
    operationId: string,
    status: string,
  ): Promise<Operation | null> {
    try {
      const result = await query(
        `UPDATE ${this.tableName}
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [status, operationId],
      );
      return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
    } catch (error) {
      logger.error('Error updating operation status:', error);
      throw error;
    }
  }

  async updateProgress(
    operationId: string,
    progress: number,
    totalAttempts: number,
    successfulAttempts: number,
    failedAttempts: number,
  ): Promise<Operation | null> {
    try {
      const result = await query(
        `UPDATE ${this.tableName}
         SET progress = $1,
             total_attempts = $2,
             successful_attempts = $3,
             failed_attempts = $4,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *`,
        [progress, totalAttempts, successfulAttempts, failedAttempts, operationId],
      );
      return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
    } catch (error) {
      logger.error('Error updating operation progress:', error);
      throw error;
    }
  }

  async completeOperation(operationId: string): Promise<Operation | null> {
    try {
      const result = await query(
        `UPDATE ${this.tableName}
         SET status = 'completed',
             completed_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [operationId],
      );
      return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
    } catch (error) {
      logger.error('Error completing operation:', error);
      throw error;
    }
  }

  async startOperation(operationId: string): Promise<Operation | null> {
    try {
      const result = await query(
        `UPDATE ${this.tableName}
         SET status = 'running',
             started_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [operationId],
      );
      return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
    } catch (error) {
      logger.error('Error starting operation:', error);
      throw error;
    }
  }
}

export const operationModel = new OperationModel();
