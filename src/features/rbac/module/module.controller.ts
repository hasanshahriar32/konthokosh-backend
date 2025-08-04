import { NextFunction, Request, Response } from 'express';
import { AppError, responseData } from '../../../utils/http';
import { MESSAGES } from '../../../configs/messages';
import {
  createModule,
  deleteModule,
  getModule,
  getModules,
  updateModule,
  getExistingModule,
  createMultiModules,
  deleteMultiModules,
  softDeleteModule,
  softDeleteMultiModules,
} from './module.service';
import { ListQuery } from '../../../types/types';
import { v4 as uuidv4 } from 'uuid';

export async function getAllModules(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await getModules(req.query as unknown as ListQuery);
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

export async function getOneModule(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const product = await getModule(Number(req.params.id));
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

export async function createOneModule(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const existingModule = await getExistingModule({ name: req.body.name });
    if (existingModule)
      return next(new AppError(`${req.body.name} is already existed!`, 400));
    const payload = {
      name: req.body.name,
      created_by: req.body.user.id,
    };
    const createdModule = await createModule(payload);
    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.CREATE,
      data: createdModule,
    });
  } catch (error) {
    next(error);
  }
}

export async function createModules(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const payload = req.body.modules.map((module: Record<string, unknown>) => ({
      name: module.name,
      created_by: req.body.user.id,
    }));
    await createMultiModules(payload);
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

export async function updateOneModule(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const payload = {
      name: req.body.name,
      updated_by: req.body.user.id,
    };
    const updatedModule = await updateModule({
      id: Number(req.params.id),
      data: payload,
    });
    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.UPDATE,
      data: updatedModule,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteOneModule(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const isExistedModule = await getModule(Number(req.params.id));
    if (!isExistedModule) return next(new AppError(MESSAGES.ERROR.BAD_REQUEST, 400));
    const deletedModule = await deleteModule(Number(req.params.id));
    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.DELETE,
      data: deletedModule,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteModules(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await deleteMultiModules(req.body.ids);
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

export async function softDeleteOneModule(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const isExistedModule = await getModule(Number(req.params.id));
    if (!isExistedModule) return next(new AppError(MESSAGES.ERROR.BAD_REQUEST, 400));
    const deletedModule = await softDeleteModule(Number(req.params.id));
    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.DELETE,
      data: deletedModule,
    });
  } catch (error) {
    next(error);
  }
}

export async function softDeleteModules(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await softDeleteMultiModules(req.body.ids);
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
