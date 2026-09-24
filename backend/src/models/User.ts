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
      is_active: row.is_active,
      is_admin: row.is_admin,
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
}

export const userModel = new UserModel();
