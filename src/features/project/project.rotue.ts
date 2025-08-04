import { Router } from 'express';
import validator from './project.validator';
import { validateRequest } from '../../middlewares/validation';
import {
  createOneProject,
  deleteOneProject,
  getAllProjects,
  getOneProject,
  updateOneProject,
} from './project.controller';
import verifyRBAC from '../../middlewares/rbac';
import { ACTIONS, MODULES, ROLES, SUB_MODULES } from '../../configs/rbac';
import { verifyToken } from '../../middlewares/jwt';

const projectRoutes = Router();

// =========================
// GET /projects
// - Get all projects with pagination and search
// - Requires JWT authentication to filter by user
// =========================
projectRoutes.get(
  '/projects',
  verifyToken, // JWT authentication
  // verifyRBAC({
  //   action: ACTIONS.VIEW,
  //   roles: [ROLES.ADMIN, ROLES.USER], // Configure as needed
  //   module: MODULES.PROJECT_MANAGEMENT, // Add to rbac config
  //   subModule: SUB_MODULES.PROJECT, // Add to rbac config
  // }),
  validateRequest(validator.select),
  getAllProjects
);

// =========================
// GET /projects/:id
// - Get a single project by ID
// - Requires JWT authentication to check ownership
// =========================
projectRoutes.get(
  '/projects/:id',
  verifyToken, // JWT authentication
  // verifyRBAC({
  //   action: ACTIONS.VIEW,
  //   roles: [ROLES.ADMIN, ROLES.USER],
  //   module: MODULES.PROJECT_MANAGEMENT,
  //   subModule: SUB_MODULES.PROJECT,
  // }),
  validateRequest(validator.detail),
  getOneProject
);

// =========================
// POST /projects
// - Create a new project
// - Requires JWT authentication
// =========================
projectRoutes.post(
  '/projects',
  verifyToken, // JWT authentication
  // verifyRBAC({
  //   action: ACTIONS.CREATE,
  //   roles: [ROLES.ADMIN, ROLES.USER],
  //   module: MODULES.PROJECT_MANAGEMENT,
  //   subModule: SUB_MODULES.PROJECT,
  // }),
  validateRequest(validator.create),
  createOneProject
);

// =========================
// PUT /projects/:id
// - Update an existing project
// - Requires JWT authentication
// =========================
projectRoutes.put(
  '/projects/:id',
  verifyToken, // JWT authentication
  // verifyRBAC({
  //   action: ACTIONS.UPDATE,
  //   roles: [ROLES.ADMIN, ROLES.USER],
  //   module: MODULES.PROJECT_MANAGEMENT,
  //   subModule: SUB_MODULES.PROJECT,
  // }),
  validateRequest(validator.update),
  updateOneProject
);

// =========================
// DELETE /projects/:id
// - Delete a project
// - Requires JWT authentication
// =========================
projectRoutes.delete(
  '/projects/:id',
  verifyToken, // JWT authentication
  // verifyRBAC({
  //   action: ACTIONS.DELETE,
  //   roles: [ROLES.ADMIN], // Only admin can delete
  //   module: MODULES.PROJECT_MANAGEMENT,
  //   subModule: SUB_MODULES.PROJECT,
  // }),
  validateRequest(validator.delete),
  deleteOneProject
);

export default projectRoutes;