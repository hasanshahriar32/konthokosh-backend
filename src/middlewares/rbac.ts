import { Request, Response, NextFunction } from 'express';
import db from '../db/db';
import { AppError } from '../utils/http';
import { MESSAGES } from '../configs/messages';
import { eq, inArray } from 'drizzle-orm';
import {
  userRoles,
  roles,
  rolePermissions,
  permissions,
  actions,
  modules,
  subModules,
} from '../db/schema/rbac';
import { getLocalUserIdFromClerkUID } from '../utils/common';

interface RBACParams {
  roles: string[];
  action: string;
  module?: string;
  subModule?: string;
}

const verifyRBAC = ({
  roles: allowedRoles,
  action,
  module,
  subModule,
}: RBACParams) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userFromJwt = (req as any).user;
      const userFromBody = req.body.user;
      let userId = userFromJwt?.id || userFromJwt?.sub || userFromBody?.id;
      if (typeof userId === 'string' && userId.startsWith('user_')) {
        userId = await getLocalUserIdFromClerkUID(userId);
      }
      if (!userId) return next(new AppError(MESSAGES.ERROR.NO_PERMISSION, 403));

      const userRoleRows = await db
        .select({ roleId: userRoles.roleId })
        .from(userRoles)
        .where(eq(userRoles.userId, userId));
      const userRoleIds = userRoleRows
        .map((ur) => ur.roleId)
        .filter((id): id is number => id !== null && id !== undefined);
      if (!userRoleIds.length)
        return next(new AppError(MESSAGES.ERROR.NO_PERMISSION, 403));

      const userRoleNameRows = await db
        .select({ name: roles.name })
        .from(roles)
        .where(inArray(roles.id, userRoleIds));
      const userRoleNames = userRoleNameRows.map((r) => r.name);
      const userRoleNamesLower = userRoleNames.map((r) => r.toLowerCase());
      const allowedRolesLower = allowedRoles.map((r) => r.toLowerCase());
      if (!userRoleNamesLower.some((r) => allowedRolesLower.includes(r))) {
        return next(new AppError(MESSAGES.ERROR.NO_PERMISSION, 403));
      }

      const allPerms = await db
        .select({
          permissionId: permissions.id,
          actionName: actions.name,
          moduleName: modules.name,
          subModuleName: subModules.name,
        })
        .from(rolePermissions)
        .innerJoin(
          permissions,
          eq(rolePermissions.permissionId, permissions.id)
        )
        .innerJoin(actions, eq(permissions.actionId, actions.id))
        .innerJoin(modules, eq(permissions.moduleId, modules.id))
        .innerJoin(subModules, eq(permissions.subModuleId, subModules.id))
        .where(inArray(rolePermissions.roleId, userRoleIds));

      const norm = (val: string | undefined) => (val || '').toLowerCase().replace(/_/g, ' ').trim();
      const normAction = norm(action);
      const normModule = norm(module);
      const normSubModule = norm(subModule);

      const hasPerm = allPerms.some(
        (perm: any) =>
          norm(perm.actionName) === normAction &&
          norm(perm.moduleName) === normModule &&
          norm(perm.subModuleName) === normSubModule
      );
      if (!hasPerm) return next(new AppError(MESSAGES.ERROR.NO_PERMISSION, 403));
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default verifyRBAC;
