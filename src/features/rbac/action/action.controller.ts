import { NextFunction, Request, Response } from 'express';
import { AppError, responseData } from '../../../utils/http';
import { MESSAGES } from '../../../configs/messages';
import {
  createAction,
  deleteAction,
  getAction,
  getActions,
  updateAction,
  getExistingAction,
  createMultiActions,
  deleteMultiActions,
  softDeleteAction,
  softDeleteMultiActions,
} from './action.service';
import db from '../../../db/db';
import { ListQuery } from '../../../types/types';
import { v4 as uuidv4 } from 'uuid';

export async function getAllActions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await getActions(req.query as unknown as ListQuery);

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

export async function getOneAction(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const product = await getAction(req.params.id);

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

export async function createOneAction(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const existingAction = await getExistingAction({ name: req.body.name });
    if (existingAction)
      return next(new AppError(`${req.body.name} is already existed!`, 400));

    const payload = {
      name: req.body.name,
      created_by: req.body.user.id,
    };
    const createdAction = await createAction(payload);

    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.CREATE,
      data: createdAction,
    });
  } catch (error) {
    next(error);
  }
}

export async function createActions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const payload = req.body.actions.map((action: Record<string, unknown>) => ({
      name: action.name,
      created_by: req.body.user.id,
    }));
    await createMultiActions(payload);

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

export async function updateOneAction(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const payload = {
      name: req.body.name,
      updated_by: req.body.user.id,
    };
    const updatedAction = await updateAction({
      id: Number(req.params.id),
      data: payload,
    });

    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.UPDATE,
      data: updatedAction,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteOneAction(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const isExistedAction = await getAction(Number(req.params.id));

    if (!isExistedAction) return next(new AppError(MESSAGES.ERROR.BAD_REQUEST, 400));

    const deletedAction = await deleteAction(Number(req.params.id));

    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.DELETE,
      data: deletedAction,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteActions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await deleteMultiActions(req.body.ids);

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

export async function softDeleteOneAction(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const isExistedAction = await getAction(Number(req.params.id));

    if (!isExistedAction) return next(new AppError(MESSAGES.ERROR.BAD_REQUEST, 400));

    const deletedAction = await softDeleteAction(Number(req.params.id));

    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.DELETE,
      data: deletedAction,
    });
  } catch (error) {
    next(error);
  }
}

export async function softDeleteActions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await softDeleteMultiActions(req.body.ids);

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
