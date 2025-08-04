import { Response } from 'express';

type ResponseData<T> = {
  statusCode?: number;
  success: boolean;
  message: string;
  meta?: Record<string, any>;
  data?: T;
};

const sendResponse = <T>(res: Response, data: ResponseData<T>): void => {
  const resData = {
    statusCode: data.statusCode || 500,
    success: data.success,
    message: data.message,
    meta: data.meta,
    data: data.data,
  };
  res.status(data.statusCode || 500).json(resData);
};

export default sendResponse;