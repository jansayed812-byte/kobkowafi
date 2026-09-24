import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config/env';
import logger from './config/logger';
import authRoutes from './routes/auth';
import operationsRoutes from './routes/operations';
import systemRoutes from './routes/system';
import targetsRoutes from './routes/targets';
import wordlistsRoutes from './routes/wordlists';
import settingsRoutes from './routes/settings';

const app: Express = express();

// Middleware
if (config.security.helmetEnabled) {
  app.use(helmet());
}

app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Health check endpoint
app.use('/system', systemRoutes);

// API prefix
const apiRouter = express.Router();

// Mount routes
apiRouter.use('/auth', authRoutes);
apiRouter.use('/operations', operationsRoutes);
apiRouter.use('/targets', targetsRoutes);
apiRouter.use('/wordlists', wordlistsRoutes);
apiRouter.use('/settings', settingsRoutes);
// TODO: Mount results routes (via operations)
// TODO: Mount logs routes (via operations)

app.use(config.api.prefix, apiRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `${req.method} ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`${status} - ${message} - ${req.originalUrl}`);

  res.status(status).json({
    success: false,
    error: message,
    status,
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
});

export default app;
