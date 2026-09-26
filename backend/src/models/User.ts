import { BaseModel } from './BaseModel';
import { User } from '../types';
import { query } from '../config/database';
import logger from '../config/logger';

export class UserModel extends BaseModel {
  protected tableName = 'users';

  protected mapRow(row: any): User {
    return {
      id: row.id,
      email: row.email,
      password_hash: row.password_hash,
      api_key: row.api_key,
      fcmToken: row.fcm_token,
      is_active: row.is_active,
      is_admin: row.is_admin,
      notifyOnCompletion: row.notify_on_completion ?? true,
      notifyOnFailure: row.notify_on_failure ?? true,
      notifyOnStart: row.notify_on_start ?? false,
      notifyOnNewResults: row.notify_on_new_results ?? true,
      notifyDailySummary: row.notify_daily_summary ?? false,
      lastNotificationTime: row.last_notification_time,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await query(
        'SELECT * FROM users WHERE email = $1',
        [email],
      );
      return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  async findByApiKey(apiKey: string): Promise<User | null> {
    try {
      const result = await query(
        'SELECT * FROM users WHERE api_key = $1',
        [apiKey],
      );
      return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
    } catch (error) {
      logger.error('Error finding user by API key:', error);
      throw error;
    }
  }

  async createUser(email: string, passwordHash: string, isAdmin: boolean = false): Promise<User> {
    try {
      const result = await query(
        'INSERT INTO users (email, password_hash, is_admin) VALUES ($1, $2, $3) RETURNING *',
        [email, passwordHash, isAdmin],
      );
      return this.mapRow(result.rows[0]);
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async updateApiKey(userId: string, apiKey: string): Promise<User | null> {
    try {
      const result = await query(
        'UPDATE users SET api_key = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [apiKey, userId],
      );
      return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
    } catch (error) {
      logger.error('Error updating API key:', error);
      throw error;
    }
  }

  async activateUser(userId: string): Promise<User | null> {
    try {
      const result = await query(
        'UPDATE users SET is_active = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
        [userId],
      );
      return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
    } catch (error) {
      logger.error('Error activating user:', error);
      throw error;
    }
  }

  async deactivateUser(userId: string): Promise<User | null> {
    try {
      const result = await query(
        'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
        [userId],
      );
      return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
    } catch (error) {
      logger.error('Error deactivating user:', error);
      throw error;
    }
  }

  async findByPk(userId: string): Promise<User | null> {
    try {
      const result = await query(
        'SELECT * FROM users WHERE id = $1',
        [userId],
      );
      return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw error;
    }
  }

  async findAllWhere(options: { where?: Record<string, any>; attributes?: string[] }): Promise<User[]> {
    try {
      let sql = 'SELECT * FROM users';
      const params: any[] = [];
      let paramIndex = 1;

      if (options.where && Object.keys(options.where).length > 0) {
        const whereConditions = Object.entries(options.where)
          .map(([key, value]) => {
            if (Array.isArray(value)) {
              const placeholders = value.map(() => `$${paramIndex++}`).join(',');
              params.push(...value);
              return `${key} IN (${placeholders})`;
            }
            params.push(value);
            return `${key} = $${paramIndex++}`;
          })
          .join(' AND ');
        sql += ` WHERE ${whereConditions}`;
      }

      const result = await query(sql, params);
      return result.rows.map((row: any) => this.mapRow(row));
    } catch (error) {
      logger.error('Error finding users:', error);
      throw error;
    }
  }

  async updateWhere(data: Record<string, any>, options: { where: Record<string, any> }): Promise<void> {
    try {
      const setClauses = Object.keys(data)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ');
      const values = Object.values(data);
      const params = [...values];
      let paramIndex = values.length + 1;

      const whereConditions = Object.entries(options.where)
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            const placeholders = value.map(() => `$${paramIndex++}`).join(',');
            params.push(...value);
            return `${key} IN (${placeholders})`;
          }
          params.push(value);
          return `${key} = $${paramIndex++}`;
        })
        .join(' AND ');

      const sql = `UPDATE users SET ${setClauses}, updated_at = CURRENT_TIMESTAMP WHERE ${whereConditions}`;
      await query(sql, params);
    } catch (error) {
      logger.error('Error updating users:', error);
      throw error;
    }
  }
}

export const userModel = new UserModel();
