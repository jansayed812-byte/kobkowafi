import { Router, Request, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/helpers';
import os from 'os';

const router = Router();

// System health check
router.get('/health', (req: Request, res: Response) => {
  sendSuccess(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
  });
});

// System status (authenticated)
router.get('/status', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const cpus = os.cpus();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();

  sendSuccess(res, {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      total: totalMemory,
      free: freeMemory,
      used: totalMemory - freeMemory,
      percentUsed: ((totalMemory - freeMemory) / totalMemory) * 100,
    },
    cpu: {
      cores: cpus.length,
      model: cpus[0]?.model || 'Unknown',
    },
    platform: {
      os: os.platform(),
      release: os.release(),
      arch: os.arch(),
    },
  });
});

// System metrics (authenticated)
router.get('/metrics', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const memUsage = process.memoryUsage();

  sendSuccess(res, {
    timestamp: new Date().toISOString(),
    process: {
      pid: process.pid,
      uptime: process.uptime(),
      memory: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss,
      },
      cpu: process.cpuUsage(),
    },
    system: {
      loadAverage: os.loadavg(),
      freeMemory: os.freemem(),
      totalMemory: os.totalmem(),
    },
  });
});

export default router;
