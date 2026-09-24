import { BaseModel } from './BaseModel';
import { Wordlist } from '../types';
import { query } from '../config/database';
import logger from '../config/logger';

export class WordlistModel extends BaseModel {
  protected tableName = 'wordlists';

  protected mapRow(row: any): Wordlist {
    return {
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      description: row.description,
      file_path: row.file_path,
      line_count: row.line_count,
      file_size: row.file_size,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  async findByUserId(
    userId: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<Wordlist[]> {
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
      logger.error('Error finding wordlists by user:', error);
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
      logger.error('Error counting wordlists:', error);
      throw error;
    }
  }

  async createWordlist(
    userId: string,
    name: string,
    filePath: string,
    description?: string,
    lineCount?: number,
    fileSize?: number,
  ): Promise<Wordlist> {
    try {
      const result = await query(
        `INSERT INTO ${this.tableName}
         (user_id, name, description, file_path, line_count, file_size)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [userId, name, description, filePath, lineCount, fileSize],
      );
      return this.mapRow(result.rows[0]);
    } catch (error) {
      logger.error('Error creating wordlist:', error);
      throw error;
    }
  }

  async updateWordlist(
    wordlistId: string,
    updates: Partial<Omit<Wordlist, 'id' | 'created_at' | 'updated_at'>>,
  ): Promise<Wordlist | null> {
    try {
      const columns = Object.keys(updates);
      const values = Object.values(updates);
      const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');

      const result = await query(
        `UPDATE ${this.tableName}
         SET ${setClause}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${columns.length + 1}
         RETURNING *`,
        [...values, wordlistId],
      );
      return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
    } catch (error) {
      logger.error('Error updating wordlist:', error);
      throw error;
    }
  }

  async deleteWordlist(wordlistId: string, userId: string): Promise<boolean> {
    try {
      const result = await query(
        `DELETE FROM ${this.tableName} WHERE id = $1 AND user_id = $2`,
        [wordlistId, userId],
      );
      return result.rowCount! > 0;
    } catch (error) {
      logger.error('Error deleting wordlist:', error);
      throw error;
    }
  }

  async getUserWordlistTotal(userId: string): Promise<number> {
    try {
      const result = await query(
        `SELECT COALESCE(SUM(file_size), 0) as total FROM ${this.tableName}
         WHERE user_id = $1`,
        [userId],
      );
      return parseInt(result.rows[0].total, 10);
    } catch (error) {
      logger.error('Error calculating user wordlist total:', error);
      throw error;
    }
  }
}

export const wordlistModel = new WordlistModel();
