import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types';

export function sendSuccess<T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200,
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    status: statusCode,
  };
  return res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  error: string,
  statusCode: number = 400,
  message?: string,
): Response {
  const response: ApiResponse = {
    success: false,
    error,
    message: message || error,
    status: statusCode,
  };
  return res.status(statusCode).json(response);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  page: number,
  pageSize: number,
  total: number,
  statusCode: number = 200,
): Response {
  const totalPages = Math.ceil(total / pageSize);
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
  return res.status(statusCode).json(response);
}

export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function generateApiKey(): string {
  return `sk_${Math.random().toString(36).substring(2, 15)}_${Math.random()
    .toString(36)
    .substring(2, 15)}`;
}

export function getPaginationParams(page?: string, pageSize?: string): { page: number; pageSize: number } {
  const p = parseInt(page || '1', 10);
  const ps = parseInt(pageSize || '10', 10);

  return {
    page: Math.max(1, p),
    pageSize: Math.min(100, Math.max(1, ps)),
  };
}

export function getOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}
