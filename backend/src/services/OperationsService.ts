import { operationModel } from '../models/Operation';
import { resultModel } from '../models/Result';
import { logModel } from '../models/Log';
import { bruteForceService } from './BruteForceService';
import logger from '../config/logger';
import { Operation } from '../types';

export interface CreateOperationDto {
  name: string;
  description?: string;
  target: string;
  type: 'dictionary' | 'brute_force' | 'rainbow_table' | 'hybrid' | 'mask' | 'rules';
  wordlist?: string[];
  threads?: number;
  delay?: number;
  timeout?: number;
}

export class OperationsService {
  async createOperation(
    userId: string,
    data: CreateOperationDto,
  ): Promise<Operation> {
    try {
      const operation = await operationModel.create({
        user_id: userId,
        name: data.name,
        description: data.description,
        target: data.target,
        type: data.type,
        status: 'pending',
        progress: 0,
      });

      await logModel.addLog('info', `Operation created: ${data.name}`, operation.id, userId);

      return operation;
    } catch (error: any) {
      logger.error('Error creating operation:', error);
      throw new Error('Failed to create operation');
    }
  }

  async startOperation(
    operationId: string,
    userId: string,
    attackConfig: any,
    target: any,
  ): Promise<void> {
    try {
      const operation = await operationModel.findById(operationId);

      if (!operation) {
        throw new Error('Operation not found');
      }

      if (operation.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      if (operation.status !== 'pending' && operation.status !== 'paused') {
        throw new Error('Operation cannot be started in current state');
      }

      // Start brute force operation asynchronously
      bruteForceService.executeOperation(operationId, userId, target, attackConfig);

      logger.info(`Operation started: ${operationId}`);
    } catch (error: any) {
      logger.error('Error starting operation:', error);
      throw error;
    }
  }

  async getOperation(operationId: string, userId: string): Promise<Operation> {
    try {
      const operation = await operationModel.findById(operationId);

      if (!operation) {
        throw new Error('Operation not found');
      }

      if (operation.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      return operation;
    } catch (error: any) {
      logger.error('Error getting operation:', error);
      throw error;
    }
  }

  async getUserOperations(
    userId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{ operations: Operation[]; total: number }> {
    try {
      const offset = (page - 1) * pageSize;
      const operations = await operationModel.findByUserId(userId, pageSize, offset);
      const total = await operationModel.countByUserId(userId);

      return { operations, total };
    } catch (error: any) {
      logger.error('Error getting user operations:', error);
      throw error;
    }
  }

  async pauseOperation(operationId: string, userId: string): Promise<Operation | null> {
    try {
      const operation = await operationModel.findById(operationId);

      if (!operation) {
        throw new Error('Operation not found');
      }

      if (operation.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      if (operation.status !== 'running') {
        throw new Error('Only running operations can be paused');
      }

      await bruteForceService.pauseOperation(operationId);
      const updated = await operationModel.updateStatus(operationId, 'paused');

      await logModel.addLog('info', 'Operation paused', operationId, userId);

      return updated;
    } catch (error: any) {
      logger.error('Error pausing operation:', error);
      throw error;
    }
  }

  async resumeOperation(operationId: string, userId: string): Promise<Operation | null> {
    try {
      const operation = await operationModel.findById(operationId);

      if (!operation) {
        throw new Error('Operation not found');
      }

      if (operation.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      if (operation.status !== 'paused') {
        throw new Error('Only paused operations can be resumed');
      }

      await bruteForceService.resumeOperation(operationId);
      const updated = await operationModel.updateStatus(operationId, 'running');

      await logModel.addLog('info', 'Operation resumed', operationId, userId);

      return updated;
    } catch (error: any) {
      logger.error('Error resuming operation:', error);
      throw error;
    }
  }

  async cancelOperation(operationId: string, userId: string): Promise<Operation | null> {
    try {
      const operation = await operationModel.findById(operationId);

      if (!operation) {
        throw new Error('Operation not found');
      }

      if (operation.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      await bruteForceService.cancelOperation(operationId);
      const updated = await operationModel.updateStatus(operationId, 'failed');

      await logModel.addLog('info', 'Operation cancelled', operationId, userId);

      return updated;
    } catch (error: any) {
      logger.error('Error cancelling operation:', error);
      throw error;
    }
  }

  async deleteOperation(operationId: string, userId: string): Promise<boolean> {
    try {
      const operation = await operationModel.findById(operationId);

      if (!operation) {
        throw new Error('Operation not found');
      }

      if (operation.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      // Delete associated results and logs
      await resultModel.deleteByOperationId(operationId);
      await logModel.deleteByOperationId(operationId);

      // Delete operation
      const deleted = await operationModel.delete(operationId);

      if (deleted) {
        logger.info(`Operation deleted: ${operationId}`);
      }

      return deleted;
    } catch (error: any) {
      logger.error('Error deleting operation:', error);
      throw error;
    }
  }

  async getOperationResults(
    operationId: string,
    userId: string,
    page: number = 1,
    pageSize: number = 50,
  ): Promise<any> {
    try {
      const operation = await operationModel.findById(operationId);

      if (!operation) {
        throw new Error('Operation not found');
      }

      if (operation.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      const offset = (page - 1) * pageSize;
      const results = await resultModel.findByOperationId(operationId, pageSize, offset);
      const total = await resultModel.countByOperationId(operationId);

      return { results, total };
    } catch (error: any) {
      logger.error('Error getting operation results:', error);
      throw error;
    }
  }

  async getOperationLogs(
    operationId: string,
    userId: string,
    page: number = 1,
    pageSize: number = 50,
  ): Promise<any> {
    try {
      const operation = await operationModel.findById(operationId);

      if (!operation) {
        throw new Error('Operation not found');
      }

      if (operation.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      const offset = (page - 1) * pageSize;
      const logs = await logModel.findByOperationId(operationId, pageSize, offset);

      return { logs };
    } catch (error: any) {
      logger.error('Error getting operation logs:', error);
      throw error;
    }
  }
}

export const operationsService = new OperationsService();
