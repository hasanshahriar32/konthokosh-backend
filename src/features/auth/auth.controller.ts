import { NextFunction, Request, Response } from 'express';
import {
  getAccessToken,
  getPermissionsByRole,
  getRefreshToken,
  getUser,
  verifyPassword,
  generateAccessTokenFromRefresh,
} from './auth.service';
import { AppError, responseData } from '../../utils/http';
import { MESSAGES } from '../../configs/messages';
import { verifyToken as verifyClerkToken } from '@clerk/backend';
import { CLERK_SECRET_KEY } from '../../configs/envConfig';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getUser({ username: req.body.username });
    if (!user) return next(new AppError(MESSAGES.ERROR.USER_NOT_FOUND, 400));

    const isCorrectPassword = await verifyPassword(
      user.password,
      req.body.password
    );
    if (!isCorrectPassword)
      return next(new AppError(MESSAGES.ERROR.INVALID_CREDENTIAL, 400));
    delete user.password;

    const accessToken = await getAccessToken(user);
    const refreshToken = await getRefreshToken({ id: user.id });
    const userPermissions = await getPermissionsByRole(user.role_id);

    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.LOGIN,
      data: {
        accessToken,
        refreshToken,
        ...user,
        permissions: userPermissions,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Endpoint handler to exchange a valid Clerk refresh token for a new access token.
 * Expects the refresh token in the 'x-refresh-token' header.
 * Responds with a new access token if valid, else 401.
 */
export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    // The refresh token has already been verified by middleware.
    // The user payload is available at req.body.user
    const user = req.body.user;
    if (!user) {
      return next(new AppError(MESSAGES.ERROR.UNAUTHORIZED, 401));
    }
    // Generate a new access token using the service
    const accessToken = await generateAccessTokenFromRefresh(user);
    res.json({ accessToken, user });
  } catch (err: any) {
    // Use sendResponse util for non-AppError errors
    if (!(err instanceof AppError)) {
      // Import sendResponse at the top if not already imported
      // import sendResponse from '../../utils/sendResponse';
      // Use default status 500 for unexpected errors
      const sendResponse = (await import('../../utils/sendResponse')).default;
      return sendResponse(res, {
        statusCode: 500,
        success: false,
        message: err.message || 'Internal Server Error',
        data: null,
      });
    }
    next(err);
  }
}


