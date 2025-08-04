import { NextFunction, Request, Response } from 'express';
import { MESSAGES } from '../configs/messages';
import { AppError } from '../utils/http';
import { verifyToken as verifyClerkToken } from '@clerk/backend';
import { CLERK_SECRET_KEY } from '../configs/envConfig';
import axios from 'axios';

// Load environment variables from a .env file

/**
 * Middleware to verify access token using Clerk's official JWT validator
 * This function checks for the presence of a Bearer token in the Authorization header.
 * If valid, it decodes the token and attaches the payload to the request body.
 */
export async function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  // Check if the Authorization header is present and correctly formatted
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(MESSAGES.ERROR.UNAUTHORIZED, 401));
  }

  // Extract the token from the Authorization header
  const token = authHeader.split(' ')[1];

  try {
    // Use Clerk's official JWT validator
    const payload = await verifyClerkToken(
      token,
      { secretKey: CLERK_SECRET_KEY }
    );
    (req as any).user = payload; // Type-safe assertion to silence TS error
    next();
  } catch (err) {
    return next(new AppError(MESSAGES.ERROR.UNAUTHORIZED, 401));
  }
}

/**
 * Middleware to verify Clerk refresh token (just verifies, does not generate new token)
 * Checks for the presence of a refresh token in the 'x-refresh-token' header.
 * If valid, attaches the payload to req.body.user and calls next().
 */
export async function verifyRefreshToken(req: Request, res: Response, next: NextFunction) {
  const refreshToken = req.headers['x-refresh-token'] as string | undefined;
  if (!refreshToken) {
    return next(new AppError(MESSAGES.ERROR.UNAUTHORIZED, 401));
  }
  try {
    const payload = await verifyClerkToken(refreshToken, { secretKey: CLERK_SECRET_KEY });
    next();
  } catch (err) {
    next(new AppError(MESSAGES.ERROR.UNAUTHORIZED, 401));
  }
}

