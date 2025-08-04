import { NextFunction, Request, Response } from 'express';
import { AppError, responseData } from '../../utils/http';
import { MESSAGES } from '../../configs/messages';
import {
  createUser,
  createUserFromClerk,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from './user.service';
import { ListQuery } from '../../types/types';
import { Request as ExpressRequest } from 'express';
import { JwtPayload } from '../../types/express';
import { getAuthenticatedUserId, getClerkUID } from '../../utils/auth';

export type AuthedRequest = ExpressRequest & { user?: JwtPayload };

export async function getAllUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await getUsers(req.query as unknown as ListQuery);
    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.RETRIVE,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOneUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await getUser(req.params.id);
    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.RETRIVE,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function createOneUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Get Clerk UID from JWT middleware
    const clerkUID = getClerkUID(req);
    
    // Use service to create or fetch user from Clerk
    const { user, alreadyExists } = await createUserFromClerk(clerkUID);
    if (alreadyExists) {
      return responseData({
        res,
        status: 409,
        message: 'User already exists',
        data: user,
      });
    }
    responseData({
      res,
      status: 201,
      message: MESSAGES.SUCCESS.CREATE,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateOneUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Accepts: firstName, lastName, emails (array of { email, type })
    const { firstName, lastName, emails } = req.body;
    const payload: any = {};
    if (firstName) payload.firstName = firstName;
    if (lastName) payload.lastName = lastName;
    if (emails && Array.isArray(emails)) payload.emails = emails;
    payload.updatedAt = new Date();
    const updatedUser = await updateUser({
      id: req.params.id,
      data: payload,
    });
    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.UPDATE,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteOneUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const deletedUser = await deleteUser(req.params.id);
    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.DELETE,
      data: deletedUser,
    });
  } catch (error) {
    next(error);
  }
}
