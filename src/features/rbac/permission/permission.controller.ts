import { NextFunction, Request, Response } from 'express';
import { responseData } from '../../../utils/http';
import { MESSAGES } from '../../../configs/messages';
import {
  getPermissionsByUser,
  deleteMultiPermissions,
  createMultiPermissions,
  getPermissions,
  getRolesOnChannelData,
} from './permission.service';
import db from '../../../db/db';
import { ListQuery } from '../../../types/types';

export async function getAllRoleOnChannels(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await getRolesOnChannelData(
      req.query as unknown as ListQuery
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

export async function getAllPermissions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await getPermissions(req.query);

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

export async function updatePermissionsByRole(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Remove all permissions for this role/channel
    // req.body.permissionIds should be an array of numbers (permission IDs to delete)
    await deleteMultiPermissions(req.body.permissionIds as number[]);

    // Prepare and create new permissions
    const preparedMultiCreatePayload = req.body.permissions.flatMap(
      (permission: Record<string, any>) =>
        (permission.actions as (string | number)[]).map((actionId) => ({
          actionId: Number(actionId),
          roleId: Number(req.body.role_id),
          moduleId: Number(permission.module_id),
          subModuleId: Number(permission.sub_module_id),
          channelId: permission.channel_id
            ? Number(permission.channel_id)
            : undefined,
        }))
    );
    await createMultiPermissions(preparedMultiCreatePayload);

    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.UPDATE,
      data: null,
    });
  } catch (error) {
    next(error);
  }
}
