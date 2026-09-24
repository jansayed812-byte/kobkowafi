import { targetModel } from '../models/Target';
import logger from '../config/logger';
import { Target } from '../types';

export interface CreateTargetDto {
  name: string;
  protocol: 'ssh' | 'http' | 'ftp' | 'database' | 'custom';
  host: string;
  port?: number;
  username?: string;
  metadata?: Record<string, any>;
}

export class TargetsService {
  async createTarget(userId: string, data: CreateTargetDto): Promise<Target> {
    try {
      // Validate host
      if (!this.isValidHost(data.host)) {
        throw new Error('Invalid host format');
      }

      const target = await targetModel.createTarget(
        userId,
        data.name,
        data.protocol,
        data.host,
        data.port,
        data.username,
        data.metadata,
      );

      logger.info(`Target created: ${target.name} (${target.protocol}://${target.host})`);
      return target;
    } catch (error: any) {
      logger.error('Error creating target:', error);
      throw error;
    }
  }

  async getTarget(targetId: string, userId: string): Promise<Target> {
    try {
      const target = await targetModel.findById(targetId);

      if (!target) {
        throw new Error('Target not found');
      }

      if (target.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      return target;
    } catch (error: any) {
      logger.error('Error getting target:', error);
      throw error;
    }
  }

  async getUserTargets(
    userId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{ targets: Target[]; total: number }> {
    try {
      const offset = (page - 1) * pageSize;
      const targets = await targetModel.findByUserId(userId, pageSize, offset);
      const total = await targetModel.countByUserId(userId);

      return { targets, total };
    } catch (error: any) {
      logger.error('Error getting user targets:', error);
      throw error;
    }
  }

  async getTargetsByProtocol(userId: string, protocol: string): Promise<Target[]> {
    try {
      return await targetModel.findByProtocol(userId, protocol);
    } catch (error: any) {
      logger.error('Error getting targets by protocol:', error);
      throw error;
    }
  }

  async updateTarget(
    targetId: string,
    userId: string,
    updates: Partial<CreateTargetDto>,
  ): Promise<Target> {
    try {
      const target = await this.getTarget(targetId, userId);

      if (updates.host && !this.isValidHost(updates.host)) {
        throw new Error('Invalid host format');
      }

      const updated = await targetModel.updateTarget(targetId, updates);

      if (!updated) {
        throw new Error('Failed to update target');
      }

      logger.info(`Target updated: ${updated.name}`);
      return updated;
    } catch (error: any) {
      logger.error('Error updating target:', error);
      throw error;
    }
  }

  async deleteTarget(targetId: string, userId: string): Promise<boolean> {
    try {
      const target = await this.getTarget(targetId, userId);
      const deleted = await targetModel.delete(targetId);

      if (deleted) {
        logger.info(`Target deleted: ${target.name}`);
      }

      return deleted;
    } catch (error: any) {
      logger.error('Error deleting target:', error);
      throw error;
    }
  }

  private isValidHost(host: string): boolean {
    // Simple validation: check for IP or domain pattern
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    const domainPattern = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    const localhostPattern = /^localhost$/;

    return ipPattern.test(host) || domainPattern.test(host) || localhostPattern.test(host);
  }
}

export const targetsService = new TargetsService();
