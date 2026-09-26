import { Router, Response } from 'express';
import { body } from 'express-validator';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import { settingsService } from '../services/SettingsService';
import { sendSuccess, sendError } from '../utils/helpers';

const router = Router();

// All settings routes require authentication
router.use(authMiddleware);

// Get user settings
router.get(
  '/',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const settings = await settingsService.getSettings(req.userId!);
      sendSuccess(res, settings);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  },
);

// Update settings
router.put(
  '/',
  [
    body('theme').optional().isIn(['light', 'dark', 'auto']),
    body('fontSize').optional().isInt({ min: 10, max: 24 }),
    body('primaryColor').optional().matches(/^#[0-9A-F]{6}$/i),
    body('notificationsEnabled').optional().isBoolean(),
    body('maxAttempts').optional().isInt({ min: 1 }),
    body('connectionDelay').optional().isInt({ min: 0 }),
    body('maxThreads').optional().isInt({ min: 1, max: 32 }),
  ],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const settings = await settingsService.updateSettings(req.userId!, {
        theme: req.body.theme,
        fontSize: req.body.fontSize,
        primaryColor: req.body.primaryColor,
        notificationsEnabled: req.body.notificationsEnabled,
        maxAttempts: req.body.maxAttempts,
        connectionDelay: req.body.connectionDelay,
        maxThreads: req.body.maxThreads,
        metadata: req.body.metadata,
      });
      sendSuccess(res, settings, 'Settings updated successfully');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  },
);

// Update theme
router.post(
  '/theme/:theme',
  [body('theme').isIn(['light', 'dark', 'auto'])],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const settings = await settingsService.updateTheme(
        req.userId!,
        req.params.theme as 'light' | 'dark' | 'auto',
      );
      sendSuccess(res, settings, 'Theme updated');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  },
);

// Update notifications
router.post(
  '/notifications/:enabled',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const enabled = req.params.enabled === 'true';
      const settings = await settingsService.updateNotifications(req.userId!, enabled);
      sendSuccess(
        res,
        settings,
        `Notifications ${enabled ? 'enabled' : 'disabled'}`,
      );
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  },
);

// Reset to defaults
router.post(
  '/reset',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const settings = await settingsService.resetSettings(req.userId!);
      sendSuccess(res, settings, 'Settings reset to defaults');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  },
);

export default router;
