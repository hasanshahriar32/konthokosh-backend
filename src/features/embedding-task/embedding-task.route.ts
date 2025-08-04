import { Router } from 'express';
import { EmbeddingTaskController } from './embedding-task.controller';
import { verifyToken } from '../../middlewares/jwt';
import { validateRequest } from '../../middlewares/validation';
import {
  createEmbeddingTaskSchema,
  paginationSchema,
  webhookUpdateSchema,
  taskIdParamSchema,
  projectIdParamSchema
} from './embedding-task.validator';

const router = Router();
const embeddingTaskController = new EmbeddingTaskController();

// Routes that require JWT authentication
router.get(
  '/',
  verifyToken,
  validateRequest({ query: paginationSchema }),
  embeddingTaskController.getEmbeddingTasks
);

router.post(
  '/',
  verifyToken,
  validateRequest({ body: createEmbeddingTaskSchema }),
  embeddingTaskController.createEmbeddingTask
);

router.get(
  '/project/:projectId',
  verifyToken,
  validateRequest({ params: projectIdParamSchema }),
  embeddingTaskController.getEmbeddingTasksByProject
);

router.get(
  '/:id',
  verifyToken,
  validateRequest({ params: taskIdParamSchema }),
  embeddingTaskController.getEmbeddingTaskById
);

router.delete(
  '/:id',
  verifyToken,
  validateRequest({ params: taskIdParamSchema }),
  embeddingTaskController.deleteEmbeddingTask
);

// Webhook endpoint (no JWT authentication, uses webhook token instead)
router.post(
  '/webhook/status-update',
  validateRequest({ body: webhookUpdateSchema }),
  embeddingTaskController.webhookStatusUpdate
);

// Public status endpoint (for external services)
router.get(
  '/status/:taskId',
  embeddingTaskController.getTaskStatus
);

// Debug endpoint (for troubleshooting)
router.get(
  '/debug/tasks',
  embeddingTaskController.debugTasks
);

// Debug endpoint for webhook activity
router.get(
  '/debug/webhook-activity',
  embeddingTaskController.debugWebhookActivity
);

export default router;
