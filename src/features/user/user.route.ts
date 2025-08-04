import { Router } from 'express';
import validator from './user.validator';
import { validateRequest } from '../../middlewares/validation';
import {
  createOneUser,
  deleteOneUser,
  getAllUsers,
  getOneUser,
  updateOneUser,
} from './user.controller';
import verifyRBAC from '../../middlewares/rbac';
import { ACTIONS, MODULES, ROLES, SUB_MODULES } from '../../configs/rbac';
import { upload } from '../../middlewares/multer-upload';

const userRoutes = Router();

// =========================
// GET /users
// - Get all users
// - Requires ADMIN role with VIEW permission
// =========================
userRoutes.get(
  '/users',
  verifyRBAC({
    action: ACTIONS.VIEW,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER,
  }),
  validateRequest(validator.select),
  getAllUsers
);

// =========================
// GET /users/:id
// - Get a user by ID
// - Requires ADMIN role with VIEW permission
// =========================
userRoutes.get(
  '/users/:id',
  verifyRBAC({
    action: ACTIONS.VIEW,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER,
  }),
  validateRequest(validator.detail),
  getOneUser
);

// =========================
// POST /users
// - Create a new user
// - Requires ADMIN role with CREATE permission
// - Accepts single file upload (e.g., profile picture)
// =========================
userRoutes.post(
  '/users',
  validateRequest(validator.create),
  createOneUser
);

// =========================
// PATCH /users/:id
// - Update a user by ID
// - Requires ADMIN role with UPDATE permission
// =========================
userRoutes.patch(
  '/users/:id',
  verifyRBAC({
    action: ACTIONS.UPDATE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER,
  }),
  validateRequest(validator.update),
  updateOneUser
);

// =========================
// DELETE /users/:id
// - Delete a user by ID
// - Requires ADMIN role with DELETE permission
// =========================
userRoutes.delete(
  '/users/:id',
  verifyRBAC({
    action: ACTIONS.DELETE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER,
  }),
  validateRequest(validator.delete),
  deleteOneUser
);

export default userRoutes;
