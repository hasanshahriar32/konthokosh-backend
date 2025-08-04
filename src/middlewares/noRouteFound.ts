import { Request, Response } from 'express';

const noRouteFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: 'Route not found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: 'Api not Found :(',
      },
    ],
  });
};

export default noRouteFound;