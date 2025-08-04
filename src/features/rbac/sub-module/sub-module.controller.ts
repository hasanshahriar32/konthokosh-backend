import { NextFunction, Request, Response } from 'express';
import { AppError, responseData } from '../../../utils/http';
import { MESSAGES } from '../../../configs/messages';
import {
  createSubModule,
  deleteSubModule,
  getSubModule,
  getSubModules,
  updateSubModule,
  getExistingSubModule,
  createMultiSubModules,
  deleteMultiSubModules,
  softDeleteSubModule,
  softDeleteMultiSubModules,
} from './sub-module.service';
import { ListQuery } from '../../../types/types';

export async function getAllSubModules(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await getSubModules(
      req.query as unknown as ListQuery & {
        channel_id: string;
        module_id: string;
      }
    );

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

export async function getOneSubModule(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const product = await getSubModule(Number(req.params.id));

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

export async function createOneSubModule(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const existingSubModule = await getExistingSubModule({
      name: req.body.name,
    });
    if (existingSubModule)
      return next(new AppError(`${req.body.name} is already existed!`, 400));
    const payload = {
      name: req.body.name,
      moduleId: Number(req.body.module_id),
      description: req.body.description,
      isActive: true,
      createdAt: new Date(),
    };
    const createdSubModule = await createSubModule(payload);

    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.CREATE,
      data: createdSubModule,
    });
  } catch (error) {
    next(error);
  }
}

export async function createSubModules(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const payload = req.body.subModules.map(
      (subModule: Record<string, unknown>) => ({
        name: subModule.name,
        moduleId: Number(subModule.module_id),
        description: subModule.description,
        isActive: true,
        createdAt: new Date(),
      })
    );
    const createdModules = await createMultiSubModules(payload);

    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.CREATE,
      data: createdModules,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateOneSubModule(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const payload = {
      name: req.body.name,
      moduleId: Number(req.body.module_id),
      description: req.body.description,
      isActive: req.body.isActive,
    };
    const updatedSubModule = await updateSubModule({
      id: Number(req.params.id),
      data: payload,
    });

    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.UPDATE,
      data: updatedSubModule,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteOneSubModule(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const isExistedSubModule = await getExistingSubModule({
      name: req.body.name,
    });

    if (!isExistedSubModule)
      return next(new AppError(MESSAGES.ERROR.BAD_REQUEST, 400));

    const deletedSubModule = await deleteSubModule(Number(req.params.id));

    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.DELETE,
      data: deletedSubModule,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteSubModules(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const ids = req.body.ids.map((id: string | number) => Number(id));
    const deletedModules = await deleteMultiSubModules(ids);

    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.DELETE,
      data: deletedModules,
    });
  } catch (error) {
    next(error);
  }
}

export async function softDeleteOneSubModule(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const isExistedSubModule = await getExistingSubModule({
      name: req.body.name,
    });

    if (!isExistedSubModule)
      return next(new AppError(MESSAGES.ERROR.BAD_REQUEST, 400));

    const deletedSubModule = await softDeleteSubModule(Number(req.params.id));

    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.DELETE,
      data: deletedSubModule,
    });
  } catch (error) {
    next(error);
  }
}

export async function softDeleteSubModules(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const ids = req.body.ids.map((id: string | number) => Number(id));
    const deletedModules = await softDeleteMultiSubModules(ids);

    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.DELETE,
      data: deletedModules,
    });
  } catch (error) {
    next(error);
  }
}
