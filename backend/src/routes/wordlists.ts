import { Router, Response } from 'express';
import { body } from 'express-validator';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import { wordlistsService } from '../services/WordlistsService';
import { sendSuccess, sendError, sendPaginated, getPaginationParams } from '../utils/helpers';

const router = Router();

// All wordlist routes require authentication
router.use(authMiddleware);

// Upload wordlist
router.post(
  '/upload',
  [body('name').trim().notEmpty().withMessage('Name is required')],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Note: In a real application, use multer middleware for file uploads
      // This is a simplified version expecting binary data in body
      if (!req.body.file || !Buffer.isBuffer(req.body.file)) {
        return sendError(res, 'No file provided', 400);
      }

      const wordlist = await wordlistsService.createWordlist(
        req.userId!,
        {
          name: req.body.name,
          description: req.body.description,
        },
        req.body.file,
      );

      sendSuccess(res, wordlist, 'Wordlist uploaded successfully', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  },
);

// Get user wordlists
router.get(
  '/',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { page, pageSize } = getPaginationParams(
        req.query.page as string,
        req.query.pageSize as string,
      );

      const { wordlists, total } = await wordlistsService.getUserWordlists(
        req.userId!,
        page,
        pageSize,
      );

      sendPaginated(res, wordlists, page, pageSize, total);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  },
);

// Get specific wordlist
router.get(
  '/:wordlistId',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const wordlist = await wordlistsService.getWordlist(
        req.params.wordlistId,
        req.userId!,
      );
      sendSuccess(res, wordlist);
    } catch (error: any) {
      sendError(res, error.message, error.message === 'Unauthorized' ? 403 : 404);
    }
  },
);

// Get wordlist content
router.get(
  '/:wordlistId/content',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const words = await wordlistsService.getWordlistContent(
        req.params.wordlistId,
        req.userId!,
      );

      // Optionally limit the number of words returned
      const limit = parseInt(req.query.limit as string) || 1000;
      const offset = parseInt(req.query.offset as string) || 0;

      const limited = words.slice(offset, offset + limit);

      sendSuccess(res, {
        words: limited,
        total: words.length,
        limit,
        offset,
      });
    } catch (error: any) {
      sendError(res, error.message, error.message === 'Unauthorized' ? 403 : 404);
    }
  },
);

// Update wordlist
router.put(
  '/:wordlistId',
  [body('name').optional().trim().notEmpty()],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const wordlist = await wordlistsService.updateWordlist(
        req.params.wordlistId,
        req.userId!,
        req.body.name,
        req.body.description,
      );
      sendSuccess(res, wordlist, 'Wordlist updated successfully');
    } catch (error: any) {
      sendError(
        res,
        error.message,
        error.message === 'Unauthorized' ? 403 : 400,
      );
    }
  },
);

// Download wordlist
router.get(
  '/:wordlistId/download',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const wordlist = await wordlistsService.getWordlist(
        req.params.wordlistId,
        req.userId!,
      );

      const buffer = await wordlistsService.downloadWordlist(
        req.params.wordlistId,
        req.userId!,
      );

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${wordlist.name}.txt"`,
      );
      res.send(buffer);
    } catch (error: any) {
      sendError(
        res,
        error.message,
        error.message === 'Unauthorized' ? 403 : 404,
      );
    }
  },
);

// Delete wordlist
router.delete(
  '/:wordlistId',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      await wordlistsService.deleteWordlist(req.params.wordlistId, req.userId!);
      sendSuccess(res, { deleted: true }, 'Wordlist deleted');
    } catch (error: any) {
      sendError(
        res,
        error.message,
        error.message === 'Unauthorized' ? 403 : 404,
      );
    }
  },
);

// Get storage usage
router.get(
  '/usage/total',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const total = await wordlistsService.getUserWordlistTotal(req.userId!);
      const maxSize = 1024 * 1024 * 1024; // 1GB default

      sendSuccess(res, {
        used: total,
        max: maxSize,
        percentUsed: (total / maxSize) * 100,
      });
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  },
);

export default router;
