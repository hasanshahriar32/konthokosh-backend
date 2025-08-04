import { Router } from 'express';
import {
  createRoles,
  createOneRole,
  deleteRoles,
  deleteOneRole,
  getAllRoles,
  getOneRole,
  softDeleteRoles,
  softDeleteOneRole,
  updateOneRole,
} from './role.controller';
import { validateRequest } from '../../../middlewares/validation';
import validator from './role.validator';
import verifyRBAC from '../../../middlewares/rbac';
import { ACTIONS, MODULES, ROLES, SUB_MODULES } from '../../../configs/rbac';

const roleRoutes = Router();

// =========================
// GET /roles
// - Get all roles
// - Requires ADMIN role with VIEW permission
// =========================
roleRoutes.get(
  '/roles',
  verifyRBAC({
    action: ACTIONS.VIEW,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.select),
  getAllRoles
);

// =========================
// GET /roles/:id
// - Get a specific role by ID
// - Requires ADMIN role with VIEW permission
// =========================
roleRoutes.get(
  '/roles/:id',
  verifyRBAC({
    action: ACTIONS.VIEW,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.detail),
  getOneRole
);

// =========================
// POST /roles/create
// - Create a single role
// - Requires ADMIN role with CREATE permission
// =========================
roleRoutes.post(
  '/roles/create',
  verifyRBAC({
    action: ACTIONS.CREATE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.create),
  createOneRole
);

// =========================
// POST /roles/create-multi
// - Create multiple roles
// - Requires ADMIN role with CREATE permission
// =========================
roleRoutes.post(
  '/roles/create-multi',
  verifyRBAC({
    action: ACTIONS.CREATE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.createMulti),
  createRoles
);

// =========================
// PATCH /roles/update/:id
// - Update a role by ID
// - Requires ADMIN role with UPDATE permission
// =========================
roleRoutes.patch(
  '/roles/update/:id',
  verifyRBAC({
    action: ACTIONS.UPDATE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.update),
  updateOneRole
);

// =========================
// DELETE /roles/delete/:id
// - Hard delete a specific role by ID
// - Requires ADMIN role with DELETE permission
// =========================
roleRoutes.delete(
  '/roles/delete/:id',
  verifyRBAC({
    action: ACTIONS.DELETE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.delete),
  deleteOneRole
);

// =========================
// POST /roles/delete-multi
// - Hard delete multiple roles
// - Requires ADMIN role with DELETE permission
// =========================
roleRoutes.post(
  '/roles/delete-multi',
  verifyRBAC({
    action: ACTIONS.DELETE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.deleteMulti),
  deleteRoles
);

// =========================
// DELETE /roles/soft-delete/:id
// - Soft delete a specific role by ID
// - Requires ADMIN role with DELETE permission
// =========================
roleRoutes.delete(
  '/roles/soft-delete/:id',
  verifyRBAC({
    action: ACTIONS.DELETE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.delete),
  softDeleteOneRole
);

// =========================
// POST /roles/soft-delete-multi
// - Soft delete multiple roles
// - Requires ADMIN role with DELETE permission
// =========================
roleRoutes.post(
  '/roles/soft-delete-multi',
  verifyRBAC({
    action: ACTIONS.DELETE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.deleteMulti),
  softDeleteRoles
);

export default roleRoutes;
