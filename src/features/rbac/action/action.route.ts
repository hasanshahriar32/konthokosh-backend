import { Router } from 'express';
import {
  createActions,
  createOneAction,
  deleteActions,
  deleteOneAction,
  getAllActions,
  getOneAction,
  softDeleteActions,
  softDeleteOneAction,
  updateOneAction,
} from './action.controller';
import { validateRequest } from '../../../middlewares/validation';
import validator from './action.validator';
import verifyRBAC from '../../../middlewares/rbac';
import { ACTIONS, MODULES, ROLES, SUB_MODULES } from '../../../configs/rbac';

const actionRoutes = Router();

// =========================
// GET /actions
// - Get all actions
// - Requires ADMIN role with VIEW permission
// =========================
actionRoutes.get(
  '/actions',
  verifyRBAC({
    action: ACTIONS.VIEW,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.select),
  getAllActions
);

// =========================
// GET /actions/:id
// - Get a specific action by ID
// - Requires ADMIN role with VIEW permission
// =========================
actionRoutes.get(
  '/actions/:id',
  verifyRBAC({
    action: ACTIONS.VIEW,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.detail),
  getOneAction
);

// =========================
// POST /actions/create
// - Create a single action
// - Requires ADMIN role with CREATE permission
// =========================
actionRoutes.post(
  '/actions/create',
  verifyRBAC({
    action: ACTIONS.CREATE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.create),
  createOneAction
);

// =========================
// POST /actions/create-multi
// - Create multiple actions
// - Requires ADMIN role with CREATE permission
// =========================
actionRoutes.post(
  '/actions/create-multi',
  verifyRBAC({
    action: ACTIONS.CREATE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.createMulti),
  createActions
);

// =========================
// PATCH /actions/:id
// - Update an action by ID
// - Requires ADMIN role with UPDATE permission
// =========================
actionRoutes.patch(
  '/actions/:id',
  verifyRBAC({
    action: ACTIONS.UPDATE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.update),
  updateOneAction
);

// =========================
// DELETE /actions/:id
// - Hard delete a specific action by ID
// - Requires ADMIN role with DELETE permission
// =========================
actionRoutes.delete(
  '/actions/:id',
  verifyRBAC({
    action: ACTIONS.DELETE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.delete),
  deleteOneAction
);

// =========================
// POST /actions/delete-multi
// - Hard delete multiple actions
// - Requires ADMIN role with DELETE permission
// =========================
actionRoutes.post(
  '/actions/delete-multi',
  verifyRBAC({
    action: ACTIONS.DELETE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.deleteMulti),
  deleteActions
);

// =========================
// DELETE /actions/soft-delete/:id
// - Soft delete a specific action by ID
// - Requires ADMIN role with DELETE permission
// =========================
actionRoutes.delete(
  '/actions/soft-delete/:id',
  verifyRBAC({
    action: ACTIONS.DELETE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.delete),
  softDeleteOneAction
);

// =========================
// POST /actions/soft-delete-multi
// - Soft delete multiple actions
// - Requires ADMIN role with DELETE permission
// =========================
actionRoutes.post(
  '/actions/soft-delete-multi',
  verifyRBAC({
    action: ACTIONS.DELETE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.deleteMulti),
  softDeleteActions
);

export default actionRoutes;
