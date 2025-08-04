import { NextFunction, Request, Response } from 'express';
import { AppError, responseData } from '../../utils/http';
import { MESSAGES } from '../../configs/messages';
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  updateProject,
  projectExists,
} from './project.service';
import { ListQuery } from '../../types/types';
import { Request as ExpressRequest } from 'express';
import { JwtPayload } from '../../types/express';
import { getAuthenticatedUserId } from '../../utils/auth';

export type AuthedRequest = ExpressRequest & { user?: JwtPayload };

export async function getAllProjects(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = await getAuthenticatedUserId(req, next);

    const result = await getProjects(
      req.query as unknown as ListQuery,
      userId
    );
    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.RETRIVE,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOneProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = await getAuthenticatedUserId(req, next);

    const project = await getProject(req.params.id, userId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }
    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.RETRIVE,
      data: project,
    });
  } catch (error) {
    next(error);
  }
}

export async function createOneProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { title, description } = req.body;
    const userId = await getAuthenticatedUserId(req, next);

    const result = await createProject({ title, description, userId });
    responseData({
      res,
      status: 201,
      message: MESSAGES.SUCCESS.CREATE,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateOneProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const projectId = req.params.id;
    const userId = await getAuthenticatedUserId(req, next);
    
    // Check if project exists and belongs to user
    const existingProject = await getProject(projectId, userId);
    if (!existingProject) {
      throw new AppError('Project not found or you do not have permission to update it', 404);
    }

    const result = await updateProject({
      id: projectId,
      data: req.body,
    });
    
    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.UPDATE,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteOneProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const projectId = req.params.id;
    const userId = await getAuthenticatedUserId(req, next);
    
    // Check if project exists and belongs to user
    const existingProject = await getProject(projectId, userId);
    if (!existingProject) {
      throw new AppError('Project not found or you do not have permission to delete it', 404);
    }

    await deleteProject(projectId);
    
    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.DELETE,
      data: { id: projectId },
    });
  } catch (error) {
    next(error);
  }
}
