import { Request, Response, NextFunction } from 'express';
import { AppError } from './http';
import { getLocalUserIdFromClerkUID } from './common';
import { createUserFromClerk } from '../features/user/user.service';

/**
 * Extracts and validates user ID from JWT middleware
 * Handles both local user IDs and Clerk UIDs
 * @param req Express request object with user attached by JWT middleware
 * @param next Express next function for error handling
 * @returns Promise<number> - Local user ID
 * @throws AppError if user is not authenticated or not found
 */
export async function getAuthenticatedUserId(req: Request, next: NextFunction): Promise<number> {
  // Get userId from JWT middleware
  const userFromJwt = (req as any).user;
  let userId = userFromJwt?.id || userFromJwt?.sub;
  
  if (!userId) {
    throw new AppError('User authentication required', 401);
  }

  // If userId is a Clerk UID (starts with 'user_'), convert to local user ID
  if (typeof userId === 'string' && userId.startsWith('user_')) {
    const clerkUID = userId;
    userId = await getLocalUserIdFromClerkUID(clerkUID);
    
    // If user not found locally, create user from Clerk token
    if (!userId) {
      try {
        const { user } = await createUserFromClerk(clerkUID);
        userId = user.id;
      } catch (error) {
        throw new AppError('Failed to create user from Clerk token', 500);
      }
    }
  }

  if (!userId) {
    throw new AppError('User authentication failed', 401);
  }

  return Number(userId);
}

/**
 * Extracts Clerk UID from JWT middleware for user registration/authentication flows
 * The JWT token from Clerk contains the user ID in the 'sub' field, which is the Clerk UID
 * @param req Express request object with user attached by JWT middleware
 * @returns string - Clerk UID (e.g., "user_xyz123")
 * @throws AppError if Clerk UID is not found
 */
export function getClerkUID(req: Request): string {
  const userFromJwt = (req as any).user;
  // The 'sub' field in Clerk JWT contains the Clerk UID
  let clerkUID = userFromJwt?.sub || userFromJwt?.id;
  
  if (!clerkUID) {
    throw new AppError('Clerk user ID not found in request. Make sure JWT middleware is applied.', 401);
  }
  
  return clerkUID;
}

/**
 * Higher-order function that wraps controller functions with user authentication
 * Automatically extracts userId and passes it to the wrapped function
 * @param controllerFn Function that takes (req, res, next, userId) parameters
 * @returns Express middleware function
 */
export function withAuth<T extends any[]>(
  controllerFn: (req: Request, res: Response, next: NextFunction, userId: number, ...args: T) => Promise<void>
) {
  return async (req: Request, res: Response, next: NextFunction, ...args: T) => {
    try {
      const userId = await getAuthenticatedUserId(req, next);
      await controllerFn(req, res, next, userId, ...args);
    } catch (error) {
      next(error);
    }
  };
}
