import { User } from '../models/User';
import { logger } from '../config/logger';

interface NotificationPayload {
  title: string;
  message: string;
  operationId?: string;
  status?: string;
  resultCount?: number;
  data?: Record<string, string>;
}

let admin: any = null;

function getFirebaseAdmin() {
  if (admin !== null) return admin;

  try {
    admin = require('firebase-admin');
    return admin;
  } catch (e) {
    logger.warn('Firebase Admin SDK not available');
    return null;
  }
}

class NotificationService {
  private initialized: boolean = false;

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      const firebaseAdmin = getFirebaseAdmin();
      if (!firebaseAdmin) {
        logger.warn('Firebase Admin SDK not available - notifications disabled');
        return;
      }

      if (!firebaseAdmin.apps.length) {
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
        if (!serviceAccountPath) {
          logger.warn('Firebase service account path not set - notifications disabled');
          return;
        }

        firebaseAdmin.initializeApp({
          credential: firebaseAdmin.credential.cert(serviceAccountPath)
        });
        this.initialized = true;
        logger.info('Firebase initialized for push notifications');
      }
    } catch (error) {
      logger.warn('Firebase initialization not available:', (error as Error).message);
    }
  }

  async sendPushNotification(
    userId: string,
    payload: NotificationPayload
  ): Promise<boolean> {
    try {
      if (!this.initialized) {
        logger.warn('Firebase not initialized - skipping notification');
        return false;
      }

      const user = await User.findByPk(userId);
      if (!user || !user.fcmToken) {
        logger.debug(`No FCM token for user ${userId}`);
        return false;
      }

      const message = {
        notification: {
          title: payload.title,
          body: payload.message
        },
        data: {
          operationId: payload.operationId || '',
          status: payload.status || '',
          resultCount: String(payload.resultCount || 0),
          ...(payload.data || {})
        },
        token: user.fcmToken,
        android: {
          priority: 'high' as const,
          notification: {
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
            channelId: 'bruteforcer_operations'
          }
        }
      };

      const response = await admin.messaging().send(message);
      logger.info(`Push notification sent to user ${userId}: ${response}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send push notification to user ${userId}:`, error);
      // If token is invalid, clear it
      if ((error as any).code === 'messaging/invalid-registration-token') {
        await User.update({ fcmToken: null }, { where: { id: userId } });
      }
      return false;
    }
  }

  async sendMulticastNotification(
    userIds: string[],
    payload: NotificationPayload
  ): Promise<{ successCount: number; failureCount: number }> {
    try {
      if (!this.initialized) {
        return { successCount: 0, failureCount: userIds.length };
      }

      const users = await User.findAll({
        where: { id: userIds },
        attributes: ['id', 'fcmToken']
      });

      const tokens = users
        .filter(u => u.fcmToken)
        .map(u => u.fcmToken as string);

      if (tokens.length === 0) {
        return { successCount: 0, failureCount: userIds.length };
      }

      const message = {
        notification: {
          title: payload.title,
          body: payload.message
        },
        data: {
          operationId: payload.operationId || '',
          status: payload.status || '',
          resultCount: String(payload.resultCount || 0),
          ...(payload.data || {})
        },
        tokens,
        android: {
          priority: 'high' as const,
          notification: {
            sound: 'default',
            channelId: 'bruteforcer_operations'
          }
        }
      };

      const response = await admin.messaging().sendMulticast(message);
      logger.info(
        `Multicast notification sent: ${response.successCount} succeeded, ${response.failureCount} failed`
      );

      // Remove invalid tokens
      const invalidTokens = response.responses
        .map((resp, idx) => (resp.success ? null : tokens[idx]))
        .filter((t): t is string => t !== null);

      if (invalidTokens.length > 0) {
        await User.update({ fcmToken: null }, {
          where: { fcmToken: invalidTokens }
        });
      }

      return {
        successCount: response.successCount,
        failureCount: response.failureCount
      };
    } catch (error) {
      logger.error('Failed to send multicast notification:', error);
      return { successCount: 0, failureCount: userIds.length };
    }
  }

  async notifyOperationCompletion(
    userId: string,
    operationId: string,
    operationName: string,
    resultCount: number,
    status: 'completed' | 'failed'
  ): Promise<boolean> {
    const user = await User.findByPk(userId);
    const shouldNotify = status === 'completed'
      ? user?.notifyOnCompletion
      : user?.notifyOnFailure;

    if (!shouldNotify) {
      return false;
    }

    const title = status === 'completed'
      ? '✓ Operation Completed'
      : '✗ Operation Failed';

    const message = status === 'completed'
      ? `${operationName} found ${resultCount} results`
      : `${operationName} failed`;

    return this.sendPushNotification(userId, {
      title,
      message,
      operationId,
      status,
      resultCount
    });
  }

  async notifyOperationStarted(
    userId: string,
    operationId: string,
    operationName: string
  ): Promise<boolean> {
    const user = await User.findByPk(userId);
    if (!user?.notifyOnStart) {
      return false;
    }

    return this.sendPushNotification(userId, {
      title: '▶ Operation Started',
      message: `${operationName} is now running`,
      operationId,
      status: 'running'
    });
  }

  async notifyNewResults(
    userId: string,
    operationId: string,
    operationName: string,
    resultCount: number
  ): Promise<boolean> {
    const user = await User.findByPk(userId);
    if (!user?.notifyOnNewResults) {
      return false;
    }

    return this.sendPushNotification(userId, {
      title: '🎯 New Results',
      message: `${operationName} found ${resultCount} new results`,
      operationId,
      status: 'running',
      resultCount
    });
  }

  async sendDailySummary(
    userId: string,
    summary: {
      totalOperations: number;
      completedToday: number;
      resultsFound: number;
      failedOperations: number;
    }
  ): Promise<boolean> {
    const user = await User.findByPk(userId);
    if (!user?.notifyDailySummary) {
      return false;
    }

    const message = `${summary.completedToday} operations completed, ${summary.resultsFound} results found`;

    return this.sendPushNotification(userId, {
      title: '📊 Daily Summary',
      message,
      data: {
        totalOperations: String(summary.totalOperations),
        completedToday: String(summary.completedToday),
        resultsFound: String(summary.resultsFound),
        failedOperations: String(summary.failedOperations)
      }
    });
  }

  async getNotificationStats(userId: string): Promise<{
    fcmTokenActive: boolean;
    lastNotificationTime?: Date;
    preferencesConfigured: boolean;
  }> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return {
          fcmTokenActive: false,
          preferencesConfigured: false
        };
      }

      return {
        fcmTokenActive: !!user.fcmToken,
        lastNotificationTime: user.lastNotificationTime,
        preferencesConfigured: true
      };
    } catch (error) {
      logger.error('Failed to get notification stats:', error);
      return {
        fcmTokenActive: false,
        preferencesConfigured: false
      };
    }
  }
}

export default new NotificationService();
