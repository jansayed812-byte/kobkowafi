import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Subscribe device to push notifications
router.post('/subscribe', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.userId;

    if (!fcmToken) {
      return res.status(400).json({ error: 'FCM token is required' });
    }

    // Update user with FCM token
    const sql = `UPDATE users SET fcm_token = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`;
    const { query } = await import('../config/database');
    await query(sql, [fcmToken, userId]);

    res.json({
      success: true,
      message: 'Device subscribed to push notifications'
    });
    return;
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
    return;
  }
});

// Unsubscribe device from push notifications
router.post('/unsubscribe', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;

    const sql = `UPDATE users SET fcm_token = null, updated_at = CURRENT_TIMESTAMP WHERE id = $1`;
    const { query } = await import('../config/database');
    await query(sql, [userId]);

    res.json({
      success: true,
      message: 'Device unsubscribed from push notifications'
    });
    return;
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
    return;
  }
});

// Get notification preferences
router.get('/preferences', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { query } = await import('../config/database');

    const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const user = result.rows[0];

    res.json({
      operationCompleted: user.notify_on_completion ?? true,
      operationFailed: user.notify_on_failure ?? true,
      operationStarted: user.notify_on_start ?? false,
      newResults: user.notify_on_new_results ?? true,
      dailySummary: user.notify_daily_summary ?? false
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Update notification preferences
router.post('/preferences', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const {
      operationCompleted,
      operationFailed,
      operationStarted,
      newResults,
      dailySummary
    } = req.body;

    const { query } = await import('../config/database');
    const sql = `UPDATE users SET
      notify_on_completion = $1,
      notify_on_failure = $2,
      notify_on_start = $3,
      notify_on_new_results = $4,
      notify_daily_summary = $5,
      updated_at = CURRENT_TIMESTAMP
      WHERE id = $6`;

    await query(sql, [
      operationCompleted ?? true,
      operationFailed ?? true,
      operationStarted ?? false,
      newResults ?? true,
      dailySummary ?? false,
      userId
    ]);

    res.json({
      success: true,
      message: 'Notification preferences updated'
    });
    return;
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
    return;
  }
});

export default router;
