import db from '../../db/db';
import { embeddingTasks, EmbeddingTask, NewEmbeddingTask } from '../../db/schema/embedding.task';
import { projects } from '../../db/schema/project';
import { eq, and, desc, sql, or } from 'drizzle-orm';
import { AppError } from '../../utils/http';
import axios from 'axios';
import { envConfig, WORKER_SERVER_TOKEN, WORKER_SERVER_URL } from '../../configs/envConfig';
import { getPaginatedData, getPagination } from '../../utils/common';
import { ListQuery } from '../../types/types';
import { logAudit } from '../../utils/log';

interface EmbeddingPaper {
  paperId: number;
  title: string;
  blobUrl: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  errorMessage?: string;
}

interface CreateEmbeddingTaskData {
  projectId: number;
}

interface ExternalUploadResponse {
  success: boolean;
  searchId: number;
  totalPapers: number;
  uploadedCount: number;
  papers: Array<{
    paperId: number;
    title: string;
    blobUrl: string;
    status: string;
  }>;
}

interface ExternalEmbeddingResponse {
  success: boolean;
  taskId: string;
  message: string;
}

// Worker server interfaces
interface WorkerBatchRequest {
  pdfUrls: string[];
  metadata: {
    source: string;
    category: string;
  };
  concurrency: number;
}

interface WorkerBatchResponse {
  batchId: string;
  status: string;
  totalTasks: number;
  taskIds: string[];
  message: string;
  estimatedProcessingTime: string;
  concurrency: number;
}

interface WorkerServerRequest {
  pdfUrls: string[];
  metadata: {
    source: string;
    category: string;
  };
  concurrency: number;
}

interface WorkerServerResponse {
  batchId: string;
  status: string;
  totalTasks: number;
  taskIds: string[];
  message: string;
  estimatedProcessingTime: string;
  concurrency: number;
}

// Helper: filter embedding tasks by keyword (taskId or status)
function buildEmbeddingTaskKeywordFilter(keyword: string) {
  if (!keyword) return undefined;
  return or(
    sql`LOWER(${embeddingTasks.taskId}) LIKE LOWER('%' || ${keyword} || '%')`,
    sql`LOWER(${embeddingTasks.status}) LIKE LOWER('%' || ${keyword} || '%')`
  );
}

export class EmbeddingTaskService {
  /**
   * Create a new embedding task by fetching PDFs and calling worker server
   */
  async createEmbeddingTask(
    userId: number,
    data: CreateEmbeddingTaskData
  ): Promise<any> {
    // Verify project belongs to user and get searchId
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, data.projectId), eq(projects.userId, userId)))
      .limit(1);

    if (!project) {
      throw new AppError('Project not found or access denied', 404);
    }

    if (!project.searchId) {
      throw new AppError('Project does not have a search ID', 400);
    }

    // Fetch PDF URLs from external service using the project's searchId
    const papersResponse = await this.fetchPapersFromExternalService(project.searchId);
    
    // Extract and validate PDF URLs from the response
    const validPapers = papersResponse.papers.filter((paper: any) => {
      const isValid = paper && 
                     typeof paper.blobUrl === 'string' && 
                     paper.blobUrl.trim().length > 0 &&
                     typeof paper.title === 'string' &&
                     paper.title.trim().length > 0;
      
      if (!isValid) {
        console.warn('Invalid paper data:', paper);
      }
      
      return isValid;
    });

    if (validPapers.length === 0) {
      throw new AppError('No valid PDF URLs found in external service response', 400);
    }

    const pdfUrls = validPapers.map((paper: any) => paper.blobUrl);
    
    console.log(`Sending ${pdfUrls.length} valid PDF URLs to worker server:`, pdfUrls.slice(0, 3));

    // Call worker server to start batch job
    const batchJobRequest: WorkerBatchRequest = {
      pdfUrls: pdfUrls,
      metadata: {
        source: 'thinkscribe',
        category: 'project-documents',
      },
      concurrency: 3, // Process 3 PDFs concurrently
    };

    console.log(`Sending batch request to worker server: ${WORKER_SERVER_URL}/api/tasks/batch`);
    console.log('Request payload:', JSON.stringify(batchJobRequest, null, 2));

    const workerResponse = await fetch(`${WORKER_SERVER_URL}/api/tasks/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WORKER_SERVER_TOKEN}`,
      },
      body: JSON.stringify(batchJobRequest),
    });

    if (!workerResponse.ok) {
      const errorText = await workerResponse.text();
      console.error('Worker server error response:', errorText);
      throw new AppError(`Failed to start batch job with worker server: ${errorText}`, 500);
    }

    const workerData: WorkerBatchResponse = await workerResponse.json();

    // Convert papers to embedding format with pending status
    const papersWithPendingStatus: EmbeddingPaper[] = validPapers.map((paper: any) => ({
      paperId: paper.paperId,
      title: paper.title,
      blobUrl: paper.blobUrl,
      status: 'pending' as const
    }));

    // Create embedding task in database with worker batch job data
    const newTask: NewEmbeddingTask = {
      userId,
      projectId: data.projectId,
      taskId: workerData.batchId, // Use batchId as taskId
      searchId: parseInt(project.searchId),
      totalPapers: workerData.totalTasks,
      uploadedCount: papersResponse.uploadedCount,
      papers: papersWithPendingStatus,
      status: workerData.status || 'pending',
    };

    const [createdTask] = await db
      .insert(embeddingTasks)
      .values(newTask)
      .returning();

    return {
      id: createdTask.id,
      projectId: createdTask.projectId,
      status: createdTask.status,
      message: workerData.message || `Embedding task created for project ${data.projectId}. Processing ${workerData.totalTasks} PDF files.`,
      batchId: workerData.batchId,
      taskIds: workerData.taskIds,
      totalTasks: workerData.totalTasks,
      concurrency: workerData.concurrency,
      estimatedProcessingTime: workerData.estimatedProcessingTime,
      pdfUrlsCount: pdfUrls.length,
      createdAt: createdTask.createdAt,
    };
  }

  /**
   * Get all embedding tasks for a user with pagination
   */
  async getUserEmbeddingTasks(
    userId: number,
    options: ListQuery
  ) {
    const { page, size, keyword } = options;
    const pagination = getPagination({
      page: page,
      size: size,
    });
    
    // Build where clause with keyword filter and userId filter
    const keywordFilter = buildEmbeddingTaskKeywordFilter(keyword || '');
    const userFilter = eq(embeddingTasks.userId, userId);
    
    const whereClause = keywordFilter 
      ? and(keywordFilter, userFilter)
      : userFilter;
    
    const dataQuery = db
      .select()
      .from(embeddingTasks)
      .where(whereClause)
      .orderBy(desc(embeddingTasks.createdAt))
      .limit(pagination.limit)
      .offset(pagination.offset);
      
    const countQuery = db
      .select({ count: sql`count(*)` })
      .from(embeddingTasks)
      .where(whereClause);
      
    return getPaginatedData(dataQuery, countQuery, options, pagination);
  }

  /**
   * Get embedding task by ID for a specific user
   */
  async getEmbeddingTaskById(userId: number, taskId: number): Promise<EmbeddingTask> {
    const [task] = await db
      .select()
      .from(embeddingTasks)
      .where(and(eq(embeddingTasks.id, taskId), eq(embeddingTasks.userId, userId)))
      .limit(1);

    if (!task) {
      throw new AppError('Embedding task not found', 404);
    }

    return task;
  }

  /**
   * Update individual PDF status via webhook
   */
  async updatePdfStatus(
    pdfUrl: string,
    status: 'success' | 'failed',
    errorMessage?: string
  ): Promise<EmbeddingTask> {
    const serviceRequestId = `pdf_update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    logAudit(`[PDF-UPDATE-${serviceRequestId}] Starting PDF status update - URL: ${pdfUrl}, Status: ${status}, Error: ${errorMessage || 'none'}`);
    
    try {
      // Find ALL embedding tasks (not just pending/processing)
      // This allows updating PDFs regardless of task status
      const allTasks = await db
        .select()
        .from(embeddingTasks);

      logAudit(`[PDF-UPDATE-${serviceRequestId}] Found ${allTasks.length} total embedding tasks to search through`);

      // Find the task that contains this PDF URL
      const task = allTasks.find((task) => 
        task.papers.some((paper: EmbeddingPaper) => paper.blobUrl === pdfUrl)
      );

      if (!task) {
        // Enhanced debugging logs
        logAudit(`[PDF-UPDATE-${serviceRequestId}] ERROR - No task found for PDF URL: ${pdfUrl}`);
        logAudit(`[PDF-UPDATE-${serviceRequestId}] Available tasks: ${allTasks.length}`);
        
        allTasks.forEach((t, index) => {
          const paperUrls = t.papers.map((p: EmbeddingPaper) => p.blobUrl);
          logAudit(`[PDF-UPDATE-${serviceRequestId}] Task ${index + 1} (ID: ${t.id}, Status: ${t.status}) has ${t.papers.length} papers: ${JSON.stringify(paperUrls)}`);
        });
        
        throw new AppError('No embedding task found for this PDF URL', 404);
      }

      logAudit(`[PDF-UPDATE-${serviceRequestId}] Found matching task - ID: ${task.id}, Status: ${task.status}, Total papers: ${task.papers.length}`);

      // Log current state of the paper being updated
      const targetPaper = task.papers.find((paper: EmbeddingPaper) => paper.blobUrl === pdfUrl);
      if (targetPaper) {
        logAudit(`[PDF-UPDATE-${serviceRequestId}] Target paper current status: ${targetPaper.status}, Title: ${targetPaper.title}`);
      }

      // Update the task status based on current status and PDF processing
      let shouldUpdateTaskStatus = false;
      let newTaskStatus = task.status;
      
      if (task.status === 'pending') {
        // If task was pending, move to processing when first PDF update comes
        shouldUpdateTaskStatus = true;
        newTaskStatus = 'processing';
        logAudit(`[PDF-UPDATE-${serviceRequestId}] Task status change: pending -> processing (first PDF update)`);
      }

      const updatedPapers = task.papers.map((paper: EmbeddingPaper) => {
        if (paper.blobUrl === pdfUrl) {
          return {
            ...paper,
            status: status,
            errorMessage: status === 'failed' ? errorMessage : undefined
          };
        }
        return paper;
      });

      // Check if all papers are completed (either success or failed)
      const allCompleted = updatedPapers.every((paper: EmbeddingPaper) => 
        paper.status === 'success' || paper.status === 'failed'
      );

      const successfulPapers = updatedPapers.filter((paper: EmbeddingPaper) => paper.status === 'success').length;
      const failedPapers = updatedPapers.filter((paper: EmbeddingPaper) => paper.status === 'failed').length;
      const pendingPapers = updatedPapers.filter((paper: EmbeddingPaper) => 
        paper.status === 'pending' || paper.status === 'processing'
      ).length;

      logAudit(`[PDF-UPDATE-${serviceRequestId}] Paper status breakdown - Success: ${successfulPapers}, Failed: ${failedPapers}, Pending: ${pendingPapers}`);

      // Determine final task status
      if (allCompleted) {
        // All papers are done - mark as completed
        newTaskStatus = 'completed';
        shouldUpdateTaskStatus = true;
        logAudit(`[PDF-UPDATE-${serviceRequestId}] All papers completed - marking task as completed`);
      } else if (task.status === 'completed') {
        // Task was completed but now has pending papers - move back to processing
        const hasPendingPapers = updatedPapers.some((paper: EmbeddingPaper) => 
          paper.status === 'pending' || paper.status === 'processing'
        );
        if (hasPendingPapers) {
          newTaskStatus = 'processing';
          shouldUpdateTaskStatus = true;
          logAudit(`[PDF-UPDATE-${serviceRequestId}] Task status change: completed -> processing (has pending papers)`);
        }
      } else if (task.status !== 'processing') {
        // Any other status should become processing when PDFs are being updated
        newTaskStatus = 'processing';
        shouldUpdateTaskStatus = true;
        logAudit(`[PDF-UPDATE-${serviceRequestId}] Task status change: ${task.status} -> processing`);
      }

      logAudit(`[PDF-UPDATE-${serviceRequestId}] Updating database - Task ID: ${task.id}, New Status: ${newTaskStatus}`);

      const [updatedTask] = await db
        .update(embeddingTasks)
        .set({
          papers: updatedPapers,
          status: newTaskStatus,
          updatedAt: new Date(),
        })
        .where(eq(embeddingTasks.id, task.id))
        .returning();

      logAudit(`[PDF-UPDATE-${serviceRequestId}] SUCCESS - PDF status updated successfully`);
      logAudit(`[PDF-UPDATE-${serviceRequestId}] Final task state - ID: ${updatedTask.id}, Status: ${updatedTask.status}, Updated at: ${updatedTask.updatedAt}`);

      return updatedTask;

    } catch (error: any) {
      logAudit(`[PDF-UPDATE-${serviceRequestId}] ERROR - Failed to update PDF status: ${error.message}`);
      logAudit(`[PDF-UPDATE-${serviceRequestId}] Error stack: ${error.stack}`);
      throw error;
    }
  }

  /**
   * Delete embedding task (only if it belongs to the user)
   */
  async deleteEmbeddingTask(userId: number, taskId: number): Promise<void> {
    const result = await db
      .delete(embeddingTasks)
      .where(and(eq(embeddingTasks.id, taskId), eq(embeddingTasks.userId, userId)))
      .returning();

    if (result.length === 0) {
      throw new AppError('Embedding task not found or access denied', 404);
    }
  }

  /**
   * Get embedding tasks by project ID for a specific user
   */
  async getEmbeddingTasksByProject(
    userId: number,
    projectId: number
  ): Promise<EmbeddingTask[]> {
    return await db
      .select()
      .from(embeddingTasks)
      .where(
        and(
          eq(embeddingTasks.userId, userId),
          eq(embeddingTasks.projectId, projectId)
        )
      )
      .orderBy(desc(embeddingTasks.createdAt));
  }

  /**
   * Initiate external embedding service
   */
  private async initiateExternalEmbedding(papers: EmbeddingPaper[]): Promise<string> {
    try {
      const response = await axios.post<ExternalEmbeddingResponse>(
        `${envConfig.EXTERNAL_SERVICE_BASE_URL}/embedding/initiate`,
        {
          papers: papers.map(paper => ({
            paperId: paper.paperId,
            title: paper.title,
            blobUrl: paper.blobUrl
          }))
        },
        {
          headers: {
            'Authorization': `Bearer ${envConfig.THINKSOURCE_API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 seconds timeout
        }
      );

      if (!response.data.success || !response.data.taskId) {
        throw new AppError('Failed to initiate external embedding service', 500);
      }

      return response.data.taskId;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'External embedding service error';
        throw new AppError(`External service error: ${message}`, 500);
      }
      throw new AppError('Failed to initiate embedding task', 500);
    }
  }

  /**
   * Fetch papers from external service using searchId
   */
  private async fetchPapersFromExternalService(searchId: string): Promise<ExternalUploadResponse> {
    const url = `${envConfig.EXTERNAL_SERVICE_BASE_URL}/api/upload/search/${searchId}`;
    
    try {
      const response = await axios.post<ExternalUploadResponse>(
        url,
        {}, // Empty body for POST request
        {
          headers: {
            'Authorization': `Bearer ${envConfig.THINKSOURCE_API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 seconds timeout
        }
      );

      if (!response.data.success) {
        throw new AppError('Failed to fetch papers from external service', 500);
      }

      // Validate the response structure
      if (!response.data.papers || !Array.isArray(response.data.papers)) {
        throw new AppError('Invalid response format from external service: no papers array', 500);
      }

      console.log(`Fetched ${response.data.papers.length} papers from external service`);
      console.log('Sample paper data:', response.data.papers.slice(0, 2));

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'External service error while fetching papers';
        throw new AppError(`External service error: ${message}`, 500);
      }
      
      throw new AppError('Failed to fetch papers from external service', 500);
    }
  }

  /**
   * Get embedding task by external task ID (for webhook/status checks)
   */
  async getTaskByExternalId(externalTaskId: string): Promise<EmbeddingTask | null> {
    const [task] = await db
      .select()
      .from(embeddingTasks)
      .where(eq(embeddingTasks.taskId, externalTaskId))
      .limit(1);

    return task || null;
  }

  /**
   * Debug method to get all tasks for troubleshooting
   */
  async getAllTasksForDebug() {
    const tasks = await db
      .select()
      .from(embeddingTasks)
      .limit(10); // Limit to avoid too much data

    return tasks.map(task => ({
      id: task.id,
      taskId: task.taskId,
      status: task.status,
      totalPapers: task.totalPapers,
      papersCount: task.papers.length,
      papers: task.papers.map((p: EmbeddingPaper) => ({
        paperId: p.paperId,
        title: p.title,
        blobUrl: p.blobUrl,
        status: p.status
      })),
      createdAt: task.createdAt
    }));
  }
}
