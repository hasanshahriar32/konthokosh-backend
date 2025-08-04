import sendResponse from './sendResponse';
import { Response } from 'express';

export class AppError extends Error {
  status: string | number;
  constructor(message: string, status: number | string) {
    super(message);
    this.status = status;
  }
}

// Wrapper to keep old responseData signature but delegate to sendResponse
export const responseData = <T>({
  res,
  status = 200,
  message,
  data,
  meta,
}: {
  res: Response;
  status?: number;
  message: string;
  data: T;
  meta?: Record<string, any>;
}) => {
  sendResponse<T>(res, {
    statusCode: status,
    success: true,
    message,
    data,
    meta,
  });
};
