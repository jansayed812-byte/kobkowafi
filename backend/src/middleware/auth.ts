import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { sendError } from '../utils/helpers';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  email?: string;
  isAdmin?: boolean;
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    sendError(res, 'Missing authorization token', 401);
    return;
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    sendError(res, 'Invalid or expired token', 401);
    return;
  }

  req.userId = decoded.userId;
  req.email = decoded.email;
  req.isAdmin = decoded.isAdmin;

  next();
}

export function adminMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  if (!req.isAdmin) {
    sendError(res, 'Admin access required', 403);
    return;
  }

  next();
}

export function optionalAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.userId = decoded.userId;
      req.email = decoded.email;
      req.isAdmin = decoded.isAdmin;
    }
  }

  next();
}
