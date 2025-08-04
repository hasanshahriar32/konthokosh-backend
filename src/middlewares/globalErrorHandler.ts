import { Request, Response, NextFunction } from 'express';
import ApiErrors from '../errorsHandler/ApiErrors';
import { AppError } from '../utils/http';
import sendResponse from '../utils/sendResponse';

const globalErrorHandler = (error: any, req: Request, res: Response, next: NextFunction): void => {
  let status = 500;
  let message = 'something is not right';
  let errorMessages: { path: string; message: string }[] = [];

  if (error instanceof ApiErrors || error instanceof AppError) {
    status = Number(error.status) || 500;
    message = error.message;
    errorMessages = error?.message
      ? [
          {
            path: req.originalUrl,
            message: error.message,
          },
        ]
      : [];
  } else if (error instanceof Error) {
    message = error.message;
    errorMessages = error?.message
      ? [
          {
            path: req.originalUrl,
            message: error.message,
          },
        ]
      : [];
  }

  sendResponse(res, {
    statusCode: status,
    success: false,
    message,
    data: errorMessages,
    meta: undefined,

  });
};

export default globalErrorHandler;