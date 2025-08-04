import { Router } from 'express';
import {
  getAllPermissions,
  getAllRoleOnChannels,
  updatePermissionsByRole,
} from './permission.controller';
import { validateRequest } from '../../../middlewares/validation';
import validator from './permission.validator';
import verifyRBAC from '../../../middlewares/rbac';
import { ACTIONS, MODULES, ROLES, SUB_MODULES } from '../../../configs/rbac';

const permissionRoutes = Router();

// =========================
// GET /role-channel-list
// - Get all roles that assigned to different channels
// - Requires ADMIN role with VIEW permission
// =========================
permissionRoutes.get(
  '/role-channel-list',
  verifyRBAC({
    action: ACTIONS.VIEW,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.select),
  getAllRoleOnChannels
);

// =========================
// GET /permissions
// - Get all permissions
// - Requires ADMIN role with VIEW permission
// =========================
permissionRoutes.get(
  '/permissions',
  verifyRBAC({
    action: ACTIONS.VIEW,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.select),
  getAllPermissions
);

// =========================
// PATCH /permissions
// - Update permissions by role
// - Requires ADMIN role with UPDATE permission
// =========================
permissionRoutes.patch(
  '/permissions',
  verifyRBAC({
    action: ACTIONS.UPDATE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.update),
  updatePermissionsByRole
);

export default permissionRoutes;
