import { BaseModel } from './BaseModel';
import { UserSettings } from '../types';
import { query } from '../config/database';
import logger from '../config/logger';

export class SettingsModel extends BaseModel {
  protected tableName = 'settings';

  protected mapRow(row: any): UserSettings {
    return {
      id: row.id,
      user_id: row.user_id,
      theme: row.theme,
      font_size: row.font_size,
      primary_color: row.primary_color,
      notifications_enabled: row.notifications_enabled,
      max_attempts: row.max_attempts,
      connection_delay: row.connection_delay,
      max_threads: row.max_threads,
      metadata: row.metadata,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  async findByUserId(userId: string): Promise<UserSettings | null> {
    try {
      const result = await query(
        `SELECT * FROM ${this.tableName} WHERE user_id = $1`,
        [userId],
      );
      return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
    } catch (error) {
      logger.error('Error finding settings by user:', error);
      throw error;
    }
  }

  async createSettings(userId: string): Promise<UserSettings> {
    try {
      const result = await query(
        `INSERT INTO ${this.tableName} (user_id) VALUES ($1) RETURNING *`,
        [userId],
      );
      return this.mapRow(result.rows[0]);
    } catch (error) {
      logger.error('Error creating settings:', error);
      throw error;
    }
  }

  async updateSettings(
    userId: string,
    updates: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>,
  ): Promise<UserSettings | null> {
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
         WHERE user_id = $${columns.length + 1}
         RETURNING *`,
        [...values, userId],
      );
      return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
    } catch (error) {
      logger.error('Error updating settings:', error);
      throw error;
    }
  }

  async updateTheme(userId: string, theme: 'light' | 'dark' | 'auto'): Promise<UserSettings | null> {
    return this.updateSettings(userId, { theme });
  }

  async updateNotifications(userId: string, enabled: boolean): Promise<UserSettings | null> {
    return this.updateSettings(userId, { notifications_enabled: enabled });
  }

  async updateOperationDefaults(
    userId: string,
    maxAttempts: number,
    connectionDelay: number,
    maxThreads: number,
  ): Promise<UserSettings | null> {
    return this.updateSettings(userId, {
      max_attempts: maxAttempts,
      connection_delay: connectionDelay,
      max_threads: maxThreads,
    });
  }
}

export const settingsModel = new SettingsModel();
