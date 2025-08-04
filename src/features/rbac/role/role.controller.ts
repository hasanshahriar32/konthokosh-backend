import sendResponse from '../../../utils/sendResponse';
import { NextFunction, Request, Response } from 'express';
import { AppError, responseData } from '../../../utils/http';
import { MESSAGES } from '../../../configs/messages';
import {
  createRole,
  deleteRole,
  getRole,
  getRoles,
  updateRole,
  getExistingRole,
  createMultiRoles,
  deleteMultiRoles,
  softDeleteRole,
  softDeleteMultiRoles,
} from './role.service';
import { ListQuery } from '../../../types/types';

export async function getAllRoles(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await getRoles(req.query as unknown as ListQuery);
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

export async function getOneRole(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const product = await getRole(Number(req.params.id));
    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.RETRIVE,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function createOneRole(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const existingRole = await getExistingRole({ name: req.body.name });
    if (existingRole)
      return next(new AppError(`${req.body.name} is already existed!`, 400));
    const payload = {
      name: req.body.name,
      description: req.body.description,
      isActive: true,
      createdAt: new Date(),
    };
    const createdRole = await createRole(payload);
    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.CREATE,
      data: createdRole,
    });
  } catch (error) {
    next(error);
  }
}

export async function createRoles(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const payload = req.body.roles.map((role: Record<string, unknown>) => ({
      name: role.name,
      description: role.description,
      isActive: true,
      createdAt: new Date(),
    }));
    await createMultiRoles(payload);
    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.CREATE,
      data: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateOneRole(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const payload = {
      name: req.body.name,
      description: req.body.description,
      isActive: req.body.isActive,
    };
    const updatedRole = await updateRole({
      id: Number(req.params.id),
      data: payload,
    });
    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.UPDATE,
      data: updatedRole,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteOneRole(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const isExistedRole = await getExistingRole({ name: req.body.name });
    if (!isExistedRole) return next(new AppError(MESSAGES.ERROR.BAD_REQUEST, 400));
    const deletedRole = await deleteRole(Number(req.params.id));
    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.DELETE,
      data: deletedRole,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteRoles(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const ids = req.body.ids.map((id: string | number) => Number(id));
    await deleteMultiRoles(ids);
    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.DELETE,
      data: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function softDeleteOneRole(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const isExistedRole = await getExistingRole({ name: req.body.name });
    if (!isExistedRole) return next(new AppError(MESSAGES.ERROR.BAD_REQUEST, 400));
    const deletedRole = await softDeleteRole(Number(req.params.id));
    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.DELETE,
      data: deletedRole,
    });
  } catch (error) {
    next(error);
  }
}

export async function softDeleteRoles(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const ids = req.body.ids.map((id: string | number) => Number(id));
    await softDeleteMultiRoles(ids);
    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.DELETE,
      data: null,
    });
  } catch (error) {
    next(error);
  }
}
