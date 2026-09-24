import express, { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { User } from '../models/User';
import { validateRequest } from '../middleware/validation';

const router = Router();

// Subscribe device to push notifications
router.post('/subscribe', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { fcmToken } = req.body;
    const userId = (req.user as any).id;

    if (!fcmToken) {
      return res.status(400).json({ error: 'FCM token is required' });
    }

    // Update user with FCM token
    await User.update(
      { fcmToken },
      { where: { id: userId } }
    );

    res.json({
      success: true,
      message: 'Device subscribed to push notifications'
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Unsubscribe device from push notifications
router.post('/unsubscribe', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;

    await User.update(
      { fcmToken: null },
      { where: { id: userId } }
    );

    res.json({
      success: true,
      message: 'Device unsubscribed from push notifications'
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get notification preferences
router.get('/preferences', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      operationCompleted: user.notifyOnCompletion ?? true,
      operationFailed: user.notifyOnFailure ?? true,
      operationStarted: user.notifyOnStart ?? false,
      newResults: user.notifyOnNewResults ?? true,
      dailySummary: user.notifyDailySummary ?? false
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Update notification preferences
router.post('/preferences', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const {
      operationCompleted,
      operationFailed,
      operationStarted,
      newResults,
      dailySummary
    } = req.body;

    await User.update(
      {
        notifyOnCompletion: operationCompleted ?? true,
        notifyOnFailure: operationFailed ?? true,
        notifyOnStart: operationStarted ?? false,
        notifyOnNewResults: newResults ?? true,
        notifyDailySummary: dailySummary ?? false
      },
      { where: { id: userId } }
    );

    res.json({
      success: true,
      message: 'Notification preferences updated'
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
