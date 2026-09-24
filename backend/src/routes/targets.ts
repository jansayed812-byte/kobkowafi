import { Router, Response } from 'express';
import { body } from 'express-validator';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import { targetsService } from '../services/TargetsService';
import { sendSuccess, sendError, sendPaginated, getPaginationParams } from '../utils/helpers';

const router = Router();

// All target routes require authentication
router.use(authMiddleware);

// Create target
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('protocol')
      .isIn(['ssh', 'http', 'ftp', 'database', 'custom'])
      .withMessage('Invalid protocol'),
    body('host').trim().notEmpty().withMessage('Host is required'),
    body('port').optional().isInt({ min: 1, max: 65535 }),
  ],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const target = await targetsService.createTarget(req.userId!, req.body);
      sendSuccess(res, target, 'Target created successfully', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  },
);

// Get user targets
router.get(
  '/',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { page, pageSize } = getPaginationParams(
        req.query.page as string,
        req.query.pageSize as string,
      );

      const { targets, total } = await targetsService.getUserTargets(
        req.userId!,
        page,
        pageSize,
      );

      sendPaginated(res, targets, page, pageSize, total);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  },
);

// Get specific target
router.get(
  '/:targetId',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const target = await targetsService.getTarget(req.params.targetId, req.userId!);
      sendSuccess(res, target);
    } catch (error: any) {
      sendError(res, error.message, error.message === 'Unauthorized' ? 403 : 404);
    }
  },
);

// Get targets by protocol
router.get(
  '/protocol/:protocol',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const targets = await targetsService.getTargetsByProtocol(
        req.userId!,
        req.params.protocol,
      );
      sendSuccess(res, { targets });
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  },
);

// Update target
router.put(
  '/:targetId',
  [
    body('name').optional().trim().notEmpty(),
    body('protocol').optional().isIn(['ssh', 'http', 'ftp', 'database', 'custom']),
    body('host').optional().trim().notEmpty(),
    body('port').optional().isInt({ min: 1, max: 65535 }),
  ],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const target = await targetsService.updateTarget(
        req.params.targetId,
        req.userId!,
        req.body,
      );
      sendSuccess(res, target, 'Target updated successfully');
    } catch (error: any) {
      sendError(
        res,
        error.message,
        error.message === 'Unauthorized' ? 403 : 400,
      );
    }
  },
);

// Delete target
router.delete(
  '/:targetId',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      await targetsService.deleteTarget(req.params.targetId, req.userId!);
      sendSuccess(res, { deleted: true }, 'Target deleted');
    } catch (error: any) {
      sendError(
        res,
        error.message,
        error.message === 'Unauthorized' ? 403 : 404,
      );
    }
  },
);

export default router;
