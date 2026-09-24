import { Router, Response } from 'express';
import { body, query } from 'express-validator';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import { operationsService } from '../services/OperationsService';
import { sendSuccess, sendError, sendPaginated, getPaginationParams } from '../utils/helpers';

const router = Router();

// All operations routes require authentication
router.use(authMiddleware);

// Create operation
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('target').trim().notEmpty().withMessage('Target is required'),
    body('type')
      .isIn(['dictionary', 'brute_force', 'rainbow_table', 'hybrid', 'mask', 'rules'])
      .withMessage('Invalid attack type'),
  ],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const operation = await operationsService.createOperation(req.userId!, req.body);
      sendSuccess(res, operation, 'Operation created successfully', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  },
);

// Get user operations
router.get(
  '/',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { page, pageSize } = getPaginationParams(
        req.query.page as string,
        req.query.pageSize as string,
      );

      const { operations, total } = await operationsService.getUserOperations(
        req.userId!,
        page,
        pageSize,
      );

      sendPaginated(res, operations, page, pageSize, total);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  },
);

// Get specific operation
router.get(
  '/:operationId',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const operation = await operationsService.getOperation(
        req.params.operationId,
        req.userId!,
      );
      sendSuccess(res, operation);
    } catch (error: any) {
      sendError(res, error.message, error.message === 'Unauthorized' ? 403 : 404);
    }
  },
);

// Start operation
router.post(
  '/:operationId/start',
  [
    body('wordlist').optional().isArray(),
    body('threads').optional().isInt({ min: 1, max: 32 }),
    body('delay').optional().isInt({ min: 0 }),
    body('timeout').optional().isInt({ min: 1000 }),
  ],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const attackConfig = {
        wordlist: req.body.wordlist || ['admin', 'password', 'test'],
        threads: req.body.threads || 4,
        delay: req.body.delay || 100,
        timeout: req.body.timeout || 10000,
      };

      const target = {
        protocol: 'http',
        host: 'localhost',
        port: 80,
      };

      await operationsService.startOperation(
        req.params.operationId,
        req.userId!,
        attackConfig,
        target,
      );

      const operation = await operationsService.getOperation(
        req.params.operationId,
        req.userId!,
      );

      sendSuccess(res, operation, 'Operation started');
    } catch (error: any) {
      sendError(
        res,
        error.message,
        error.message === 'Unauthorized' ? 403 : 400,
      );
    }
  },
);

// Pause operation
router.post(
  '/:operationId/pause',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const operation = await operationsService.pauseOperation(
        req.params.operationId,
        req.userId!,
      );
      sendSuccess(res, operation, 'Operation paused');
    } catch (error: any) {
      sendError(
        res,
        error.message,
        error.message === 'Unauthorized' ? 403 : 400,
      );
    }
  },
);

// Resume operation
router.post(
  '/:operationId/resume',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const operation = await operationsService.resumeOperation(
        req.params.operationId,
        req.userId!,
      );
      sendSuccess(res, operation, 'Operation resumed');
    } catch (error: any) {
      sendError(
        res,
        error.message,
        error.message === 'Unauthorized' ? 403 : 400,
      );
    }
  },
);

// Cancel operation
router.post(
  '/:operationId/cancel',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const operation = await operationsService.cancelOperation(
        req.params.operationId,
        req.userId!,
      );
      sendSuccess(res, operation, 'Operation cancelled');
    } catch (error: any) {
      sendError(
        res,
        error.message,
        error.message === 'Unauthorized' ? 403 : 400,
      );
    }
  },
);

// Delete operation
router.delete(
  '/:operationId',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      await operationsService.deleteOperation(
        req.params.operationId,
        req.userId!,
      );
      sendSuccess(res, { deleted: true }, 'Operation deleted');
    } catch (error: any) {
      sendError(
        res,
        error.message,
        error.message === 'Unauthorized' ? 403 : 404,
      );
    }
  },
);

// Get operation results
router.get(
  '/:operationId/results',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { page, pageSize } = getPaginationParams(
        req.query.page as string,
        req.query.pageSize as string,
      );

      const { results, total } = await operationsService.getOperationResults(
        req.params.operationId,
        req.userId!,
        page,
        pageSize,
      );

      sendPaginated(res, results, page, pageSize, total);
    } catch (error: any) {
      sendError(
        res,
        error.message,
        error.message === 'Unauthorized' ? 403 : 404,
      );
    }
  },
);

// Get operation logs
router.get(
  '/:operationId/logs',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { page, pageSize } = getPaginationParams(
        req.query.page as string,
        req.query.pageSize as string,
      );

      const { logs } = await operationsService.getOperationLogs(
        req.params.operationId,
        req.userId!,
        page,
        pageSize,
      );

      sendSuccess(res, { logs, total: logs.length });
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
