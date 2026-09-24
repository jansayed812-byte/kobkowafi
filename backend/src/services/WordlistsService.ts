import { wordlistModel } from '../models/Wordlist';
import { config } from '../config/env';
import logger from '../config/logger';
import { Wordlist } from '../types';
import fs from 'fs';
import path from 'path';

export interface CreateWordlistDto {
  name: string;
  description?: string;
}

export class WordlistsService {
  private uploadDir = config.upload.uploadDir;

  async createWordlist(
    userId: string,
    data: CreateWordlistDto,
    fileBuffer: Buffer,
  ): Promise<Wordlist> {
    try {
      // Create uploads directory if it doesn't exist
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      }

      // Check file size
      if (fileBuffer.length > config.upload.maxFileSize) {
        throw new Error(`File size exceeds maximum limit of ${config.upload.maxFileSize} bytes`);
      }

      // Generate unique filename
      const filename = `${userId}_${Date.now()}_${data.name.replace(/\s+/g, '_')}`;
      const filePath = path.join(this.uploadDir, filename);

      // Write file
      fs.writeFileSync(filePath, fileBuffer);

      // Count lines
      const content = fileBuffer.toString();
      const lineCount = content.split('\n').filter((line) => line.trim().length > 0).length;

      // Create database record
      const wordlist = await wordlistModel.createWordlist(
        userId,
        data.name,
        filePath,
        data.description,
        lineCount,
        fileBuffer.length,
      );

      logger.info(`Wordlist created: ${data.name} (${lineCount} lines)`);
      return wordlist;
    } catch (error: any) {
      logger.error('Error creating wordlist:', error);
      throw error;
    }
  }

  async getWordlist(wordlistId: string, userId: string): Promise<Wordlist> {
    try {
      const wordlist = await wordlistModel.findById(wordlistId);

      if (!wordlist) {
        throw new Error('Wordlist not found');
      }

      if (wordlist.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      return wordlist;
    } catch (error: any) {
      logger.error('Error getting wordlist:', error);
      throw error;
    }
  }

  async getUserWordlists(
    userId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{ wordlists: Wordlist[]; total: number }> {
    try {
      const offset = (page - 1) * pageSize;
      const wordlists = await wordlistModel.findByUserId(userId, pageSize, offset);
      const total = await wordlistModel.countByUserId(userId);

      return { wordlists, total };
    } catch (error: any) {
      logger.error('Error getting user wordlists:', error);
      throw error;
    }
  }

  async getWordlistContent(wordlistId: string, userId: string): Promise<string[]> {
    try {
      const wordlist = await this.getWordlist(wordlistId, userId);

      if (!fs.existsSync(wordlist.file_path)) {
        throw new Error('Wordlist file not found');
      }

      const content = fs.readFileSync(wordlist.file_path, 'utf-8');
      const words = content.split('\n').filter((line) => line.trim().length > 0);

      return words;
    } catch (error: any) {
      logger.error('Error getting wordlist content:', error);
      throw error;
    }
  }

  async updateWordlist(
    wordlistId: string,
    userId: string,
    name: string,
    description?: string,
  ): Promise<Wordlist> {
    try {
      const wordlist = await this.getWordlist(wordlistId, userId);

      const updated = await wordlistModel.updateWordlist(wordlistId, {
        name,
        description,
      });

      if (!updated) {
        throw new Error('Failed to update wordlist');
      }

      logger.info(`Wordlist updated: ${name}`);
      return updated;
    } catch (error: any) {
      logger.error('Error updating wordlist:', error);
      throw error;
    }
  }

  async deleteWordlist(wordlistId: string, userId: string): Promise<boolean> {
    try {
      const wordlist = await this.getWordlist(wordlistId, userId);

      // Delete file
      if (fs.existsSync(wordlist.file_path)) {
        fs.unlinkSync(wordlist.file_path);
      }

      // Delete database record
      const deleted = await wordlistModel.deleteWordlist(wordlistId, userId);

      if (deleted) {
        logger.info(`Wordlist deleted: ${wordlist.name}`);
      }

      return deleted;
    } catch (error: any) {
      logger.error('Error deleting wordlist:', error);
      throw error;
    }
  }

  async getUserWordlistTotal(userId: string): Promise<number> {
    try {
      return await wordlistModel.getUserWordlistTotal(userId);
    } catch (error: any) {
      logger.error('Error calculating user wordlist total:', error);
      throw error;
    }
  }

  async downloadWordlist(wordlistId: string, userId: string): Promise<Buffer> {
    try {
      const wordlist = await this.getWordlist(wordlistId, userId);

      if (!fs.existsSync(wordlist.file_path)) {
        throw new Error('Wordlist file not found');
      }

      return fs.readFileSync(wordlist.file_path);
    } catch (error: any) {
      logger.error('Error downloading wordlist:', error);
      throw error;
    }
  }
}

export const wordlistsService = new WordlistsService();
