import { Router } from 'express';
import authRoutes from './features/auth/auth.route';
import productRoutes from './features/product/product.route';
import userRoutes from './features/user/user.route';
import projectRoutes from './features/project/project.rotue';
import postRoutes from './features/post/post.route';
import embeddingTaskRoutes from './features/embedding-task/embedding-task.route';
import { verifyToken } from './middlewares/jwt';
import actionRoutes from './features/rbac/action/action.route';
import permissionRoutes from './features/rbac/permission/permission.route';
import roleRoutes from './features/rbac/role/role.route';
import channelRoutes from './features/rbac/channel/channel.route';
import moduleRoutes from './features/rbac/module/module.route';
import subModuleRoutes from './features/rbac/sub-module/sub-module.route';
import productCategoryRoutes from './features/product-category/product-category.route';

const routes = Router();

// Public routes (No authentication required)
routes.use('/api/v1/auth', authRoutes);
routes.use('/api/v1/embedding-tasks', embeddingTaskRoutes); // Some endpoints are public (webhook)

// Protected routes (Require JWT authentication)
routes.use('/api/v1', verifyToken, moduleRoutes);
routes.use('/api/v1', verifyToken, subModuleRoutes);
routes.use('/api/v1', verifyToken, channelRoutes);
routes.use('/api/v1', verifyToken, roleRoutes);
routes.use('/api/v1', verifyToken, actionRoutes);
routes.use('/api/v1', verifyToken, permissionRoutes);
routes.use('/api/v1', verifyToken, productCategoryRoutes);
routes.use('/api/v1', verifyToken, productRoutes);
routes.use('/api/v1', verifyToken, postRoutes);
routes.use('/api/v1', verifyToken, projectRoutes);
routes.use('/api/v1', verifyToken, userRoutes);

export default routes;
