import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { authService } from '../services/AuthService';
import { handleValidationErrors } from '../middleware/validation';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/helpers';

const router = Router();

// Register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await authService.register(email, password);
      sendSuccess(res, result, 'User registered successfully', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  },
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      sendSuccess(res, result, 'Login successful', 200);
    } catch (error: any) {
      sendError(res, error.message, 401);
    }
  },
);

// Get Profile
router.get(
  '/profile',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await authService.getProfile(req.userId!);
      sendSuccess(res, result, 'Profile retrieved', 200);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  },
);

// Change Password
router.post(
  '/change-password',
  authMiddleware,
  [
    body('oldPassword').notEmpty(),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
  ],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const result = await authService.changePassword(
        req.userId!,
        oldPassword,
        newPassword,
      );
      sendSuccess(res, result, 'Password changed successfully', 200);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  },
);

// Generate New API Key
router.post(
  '/api-key',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await authService.generateNewApiKey(req.userId!);
      sendSuccess(res, result, 'New API key generated', 200);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  },
);

// Refresh Token
router.post(
  '/refresh',
  [body('refreshToken').notEmpty()],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      sendSuccess(res, result, 'Token refreshed', 200);
    } catch (error: any) {
      sendError(res, error.message, 401);
    }
  },
);

export default router;
