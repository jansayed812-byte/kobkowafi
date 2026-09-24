import { query } from '../config/database';
import logger from '../config/logger';

export abstract class BaseModel {
  protected tableName: string = '';

  protected abstract mapRow(row: any): any;

  async findById(id: string): Promise<any | null> {
    try {
      const result = await query(
        `SELECT * FROM ${this.tableName} WHERE id = $1`,
        [id],
      );
      return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
    } catch (error) {
      logger.error(`Error finding ${this.tableName} by id:`, error);
      throw error;
    }
  }

  async findAll(limit: number = 10, offset: number = 0): Promise<any[]> {
    try {
      const result = await query(
        `SELECT * FROM ${this.tableName} LIMIT $1 OFFSET $2`,
        [limit, offset],
      );
      return result.rows.map((row) => this.mapRow(row));
    } catch (error) {
      logger.error(`Error finding all ${this.tableName}:`, error);
      throw error;
    }
  }

  async count(): Promise<number> {
    try {
      const result = await query(
        `SELECT COUNT(*) as count FROM ${this.tableName}`,
      );
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      logger.error(`Error counting ${this.tableName}:`, error);
      throw error;
    }
  }

  async create(data: any): Promise<any> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

    try {
      const result = await query(
        `INSERT INTO ${this.tableName} (${columns.join(', ')})
         VALUES (${placeholders})
         RETURNING *`,
        values,
      );
      return this.mapRow(result.rows[0]);
    } catch (error) {
      logger.error(`Error creating ${this.tableName}:`, error);
      throw error;
    }
  }

  async update(id: string, data: any): Promise<any | null> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');

    try {
      const result = await query(
        `UPDATE ${this.tableName} SET ${setClause}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${columns.length + 1}
         RETURNING *`,
        [...values, id],
      );
      return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
    } catch (error) {
      logger.error(`Error updating ${this.tableName}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await query(
        `DELETE FROM ${this.tableName} WHERE id = $1`,
        [id],
      );
      return result.rowCount! > 0;
    } catch (error) {
      logger.error(`Error deleting ${this.tableName}:`, error);
      throw error;
    }
  }
}
