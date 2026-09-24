import { settingsModel } from '../models/Settings';
import logger from '../config/logger';
import { UserSettings } from '../types';

export interface UpdateSettingsDto {
  theme?: 'light' | 'dark' | 'auto';
  fontSize?: number;
  primaryColor?: string;
  notificationsEnabled?: boolean;
  maxAttempts?: number;
  connectionDelay?: number;
  maxThreads?: number;
  metadata?: Record<string, any>;
}

export class SettingsService {
  async getSettings(userId: string): Promise<UserSettings> {
    try {
      let settings = await settingsModel.findByUserId(userId);

      // Create default settings if not exists
      if (!settings) {
        settings = await settingsModel.createSettings(userId);
        logger.info(`Default settings created for user: ${userId}`);
      }

      return settings;
    } catch (error: any) {
      logger.error('Error getting settings:', error);
      throw error;
    }
  }

  async updateSettings(userId: string, updates: UpdateSettingsDto): Promise<UserSettings> {
    try {
      // Validate inputs
      if (updates.fontSize && (updates.fontSize < 10 || updates.fontSize > 24)) {
        throw new Error('Font size must be between 10 and 24');
      }

      if (updates.primaryColor && !this.isValidColor(updates.primaryColor)) {
        throw new Error('Invalid color format');
      }

      if (updates.maxAttempts && updates.maxAttempts < 1) {
        throw new Error('Max attempts must be at least 1');
      }

      if (updates.connectionDelay && updates.connectionDelay < 0) {
        throw new Error('Connection delay cannot be negative');
      }

      if (updates.maxThreads && (updates.maxThreads < 1 || updates.maxThreads > 32)) {
        throw new Error('Max threads must be between 1 and 32');
      }

      // Map DTO to model fields
      const modelUpdates: any = {};
      if (updates.theme !== undefined) modelUpdates.theme = updates.theme;
      if (updates.fontSize !== undefined) modelUpdates.font_size = updates.fontSize;
      if (updates.primaryColor !== undefined) modelUpdates.primary_color = updates.primaryColor;
      if (updates.notificationsEnabled !== undefined) modelUpdates.notifications_enabled = updates.notificationsEnabled;
      if (updates.maxAttempts !== undefined) modelUpdates.max_attempts = updates.maxAttempts;
      if (updates.connectionDelay !== undefined) modelUpdates.connection_delay = updates.connectionDelay;
      if (updates.maxThreads !== undefined) modelUpdates.max_threads = updates.maxThreads;
      if (updates.metadata !== undefined) modelUpdates.metadata = updates.metadata;

      const updated = await settingsModel.updateSettings(userId, modelUpdates);

      if (!updated) {
        throw new Error('Failed to update settings');
      }

      logger.info(`Settings updated for user: ${userId}`);
      return updated;
    } catch (error: any) {
      logger.error('Error updating settings:', error);
      throw error;
    }
  }

  async updateTheme(userId: string, theme: 'light' | 'dark' | 'auto'): Promise<UserSettings> {
    return this.updateSettings(userId, { theme });
  }

  async updateNotifications(userId: string, enabled: boolean): Promise<UserSettings> {
    return this.updateSettings(userId, { notificationsEnabled: enabled });
  }

  async resetSettings(userId: string): Promise<UserSettings> {
    try {
      // Delete existing settings
      const existing = await settingsModel.findByUserId(userId);
      if (existing) {
        await settingsModel.delete(existing.id);
      }

      // Create new default settings
      const settings = await settingsModel.createSettings(userId);
      logger.info(`Settings reset for user: ${userId}`);
      return settings;
    } catch (error: any) {
      logger.error('Error resetting settings:', error);
      throw error;
    }
  }

  private isValidColor(color: string): boolean {
    // Check if it's a valid hex color
    const hexPattern = /^#[0-9A-F]{6}$/i;
    return hexPattern.test(color);
  }
}

export const settingsService = new SettingsService();
