import { Request, Response, NextFunction } from 'express';
import { EmbeddingTaskService } from './embedding-task.service';
import { getAuthenticatedUserId } from '../../utils/auth';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { AppError } from '../../utils/http';
import { WEBHOOK_SECRET_TOKEN } from '../../configs/envConfig';
import { logAudit } from '../../utils/log';
import fs from 'fs';
import path from 'path';

const embeddingTaskService = new EmbeddingTaskService();

export class EmbeddingTaskController {
  /**
   * Create a new embedding task
   * POST /embedding-tasks
   */
  createEmbeddingTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = await getAuthenticatedUserId(req, next);
    const { projectId } = req.body;

    const embeddingTask = await embeddingTaskService.createEmbeddingTask(userId, {
      projectId
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Embedding task created successfully!',
      data: embeddingTask,
    });
  });

  /**
   * Get all embedding tasks for the authenticated user
   * GET /embedding-tasks
   */
  getEmbeddingTasks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = await getAuthenticatedUserId(req, next);
    const { page, size, keyword, sort, order } = req.query;

    const paginationOptions = {
      page: Number(page),
      size: Number(size),
      keyword: keyword as string,
      sort: sort as string,
      order: order as 'asc' | 'desc',
    };

    const result = await embeddingTaskService.getUserEmbeddingTasks(userId, paginationOptions);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Successfully Retrieved!',
      data: result,
    });
  });

  /**
   * Get embedding task by ID
   * GET /embedding-tasks/:id
   */
  getEmbeddingTaskById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = await getAuthenticatedUserId(req, next);
    const taskId = Number(req.params.id);

    const embeddingTask = await embeddingTaskService.getEmbeddingTaskById(userId, taskId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Successfully Retrieved!',
      data: embeddingTask,
    });
  });

  /**
   * Get embedding tasks by project ID
   * GET /embedding-tasks/project/:projectId
   */
  getEmbeddingTasksByProject = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = await getAuthenticatedUserId(req, next);
    const projectId = Number(req.params.projectId);

    const embeddingTasks = await embeddingTaskService.getEmbeddingTasksByProject(userId, projectId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Successfully Retrieved!',
      data: embeddingTasks,
    });
  });

  /**
   * Delete embedding task
   * DELETE /embedding-tasks/:id
   */
  deleteEmbeddingTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = await getAuthenticatedUserId(req, next);
    const taskId = Number(req.params.id);

    await embeddingTaskService.deleteEmbeddingTask(userId, taskId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Successfully Deleted!',
      data: null,
    });
  });

  /**
   * Webhook endpoint for PDF status updates from external embedding service
   * POST /embedding-tasks/webhook/status-update
   */
  webhookStatusUpdate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const requestId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Log incoming webhook request
    logAudit(`[WEBHOOK-REQUEST-${requestId}] Incoming webhook request from IP: ${req.ip || req.connection.remoteAddress}`);
    logAudit(`[WEBHOOK-REQUEST-${requestId}] Headers: ${JSON.stringify(req.headers)}`);
    logAudit(`[WEBHOOK-REQUEST-${requestId}] Body: ${JSON.stringify(req.body)}`);

    try {
      const { pdfUrl, status, errorMessage, message } = req.body;

      // Log parsed request data
      logAudit(`[WEBHOOK-REQUEST-${requestId}] Parsed data - pdfUrl: ${pdfUrl}, status: ${status}, errorMessage: ${errorMessage}, message: ${message}`);

      // Verify webhook authenticity
      const webhookToken = req.headers['x-webhook-token'];
      logAudit(`[WEBHOOK-REQUEST-${requestId}] Webhook token verification - provided: ${webhookToken ? 'YES' : 'NO'}, valid: ${webhookToken === WEBHOOK_SECRET_TOKEN}`);
      
      if (webhookToken !== WEBHOOK_SECRET_TOKEN) {
        logAudit(`[WEBHOOK-REQUEST-${requestId}] AUTHENTICATION FAILED - Invalid webhook token`);
        throw new AppError('Invalid webhook token', 401);
      }

      logAudit(`[WEBHOOK-REQUEST-${requestId}] Authentication successful, processing PDF status update`);

      const updatedTask = await embeddingTaskService.updatePdfStatus(pdfUrl, status, errorMessage);

      const processingTime = Date.now() - startTime;
      logAudit(`[WEBHOOK-REQUEST-${requestId}] SUCCESS - PDF status updated in ${processingTime}ms`);
      logAudit(`[WEBHOOK-REQUEST-${requestId}] Updated task data: ${JSON.stringify({
        taskId: updatedTask.taskId,
        pdfUrl: pdfUrl,
        status: status,
        taskStatus: updatedTask.status,
        updatedAt: updatedTask.updatedAt
      })}`);

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: message || 'PDF status updated successfully',
        data: {
          taskId: updatedTask.taskId,
          pdfUrl: pdfUrl,
          status: status,
          taskStatus: updatedTask.status,
          updatedAt: updatedTask.updatedAt
        },
      });

    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      logAudit(`[WEBHOOK-REQUEST-${requestId}] ERROR - Processing failed in ${processingTime}ms`);
      logAudit(`[WEBHOOK-REQUEST-${requestId}] Error details: ${error.message}`);
      logAudit(`[WEBHOOK-REQUEST-${requestId}] Error stack: ${error.stack}`);
      
      // Re-throw the error to be handled by the global error handler
      throw error;
    }
  });

  /**
   * Get task status (public endpoint for external services)
   * GET /embedding-tasks/status/:taskId
   */
  getTaskStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { taskId } = req.params;

    // This is a simple status check endpoint that doesn't require user authentication
    // but you might want to add API key authentication for security
    const task = await embeddingTaskService.getTaskByExternalId(taskId);
    
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Task status retrieved',
      data: {
        taskId: task.taskId,
        status: task.status,
        totalPapers: task.totalPapers,
        completedPapers: task.papers.filter((p: any) => p.status === 'success').length,
        failedPapers: task.papers.filter((p: any) => p.status === 'failed').length,
        updatedAt: task.updatedAt
      },
    });
  });

  /**
   * Debug endpoint to check tasks and papers for webhook troubleshooting
   * GET /embedding-tasks/debug/tasks
   */
  debugTasks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const tasks = await embeddingTaskService.getAllTasksForDebug();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Debug tasks retrieved successfully',
      data: tasks,
    });
  });

  /**
   * Debug endpoint to check recent webhook activity
   * GET /embedding-tasks/debug/webhook-activity
   */
  debugWebhookActivity = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Read the audit log file to get recent webhook activity
      const logPath = path.join(process.cwd(), 'src', 'storage', 'logs', 'audit.log');
      
      if (!fs.existsSync(logPath)) {
        logAudit('[WEBHOOK-DEBUG] Audit log file does not exist');
        return sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'No webhook activity found - audit log does not exist',
          data: { recentActivity: [], message: 'Audit log file not found' },
        });
      }

      const logContent = fs.readFileSync(logPath, 'utf-8');
      const logLines = logContent.split('\n').filter((line: string) => line.trim());
      
      // Filter for webhook-related logs in the last 1000 lines
      const recentLines = logLines.slice(-1000);
      const webhookLines = recentLines.filter((line: string) => 
        line.includes('WEBHOOK-REQUEST') || line.includes('PDF-UPDATE')
      );

      logAudit('[WEBHOOK-DEBUG] Retrieved webhook activity logs for debugging');

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Recent webhook activity retrieved successfully',
        data: {
          recentActivity: webhookLines.slice(-50), // Last 50 webhook-related log entries
          totalWebhookLogs: webhookLines.length,
          totalLogLines: logLines.length
        },
      });

    } catch (error: any) {
      logAudit(`[WEBHOOK-DEBUG] Error reading audit logs: ${error.message}`);
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Error reading webhook activity logs',
        data: { error: error.message, recentActivity: [] },
      });
    }
  });
}
