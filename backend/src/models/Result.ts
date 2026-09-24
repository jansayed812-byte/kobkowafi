import { BaseModel } from './BaseModel';
import { Result } from '../types';
import { query } from '../config/database';
import logger from '../config/logger';

export class ResultModel extends BaseModel {
  protected tableName = 'results';

  protected mapRow(row: any): Result {
    return {
      id: row.id,
      operation_id: row.operation_id,
      result_type: row.result_type,
      username: row.username,
      password: row.password,
      data: row.data,
      timestamp: row.timestamp,
    };
  }

  async findByOperationId(
    operationId: string,
    limit: number = 100,
    offset: number = 0,
  ): Promise<Result[]> {
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
      logger.error('Error finding results by operation:', error);
      throw error;
    }
  }

  async countByOperationId(operationId: string): Promise<number> {
    try {
      const result = await query(
        `SELECT COUNT(*) as count FROM ${this.tableName}
         WHERE operation_id = $1`,
        [operationId],
      );
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      logger.error('Error counting results:', error);
      throw error;
    }
  }

  async findSuccessfulByOperationId(operationId: string): Promise<Result[]> {
    try {
      const result = await query(
        `SELECT * FROM ${this.tableName}
         WHERE operation_id = $1 AND result_type = 'success'
         ORDER BY timestamp DESC`,
        [operationId],
      );
      return result.rows.map((row) => this.mapRow(row));
    } catch (error) {
      logger.error('Error finding successful results:', error);
      throw error;
    }
  }

  async addResult(
    operationId: string,
    resultType: string,
    username?: string,
    password?: string,
    data?: Record<string, any>,
  ): Promise<Result> {
    try {
      const result = await query(
        `INSERT INTO ${this.tableName}
         (operation_id, result_type, username, password, data)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [operationId, resultType, username, password, JSON.stringify(data || {})],
      );
      return this.mapRow(result.rows[0]);
    } catch (error) {
      logger.error('Error adding result:', error);
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
      logger.error('Error deleting results:', error);
      throw error;
    }
  }
}

export const resultModel = new ResultModel();
