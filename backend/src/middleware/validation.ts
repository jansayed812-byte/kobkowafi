import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { sendError } from '../utils/helpers';

export function handleValidationErrors(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err: any) => ({
      field: err.param,
      message: err.msg,
    }));

    sendError(
      res,
      'Validation error',
      400,
      JSON.stringify(errorMessages),
    );
    return;
  }

  next();
}
