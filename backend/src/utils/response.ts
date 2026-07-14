import type { Response } from 'express';

function send(
  res: Response,
  status: number,
  success: boolean,
  data?: unknown,
  message?: string,
  details?: unknown,
) {
  const body: Record<string, unknown> = { success };
  if (data !== undefined) body.data = data;
  if (message) body.message = message;
  if (details) body.details = details;
  return res.status(status).json(body);
}

export function sendSuccess(res: Response, data?: unknown, message?: string, status = 200) {
  return send(res, status, true, data, message);
}

export function sendCreated(res: Response, data?: unknown, message?: string) {
  return send(res, 201, true, data, message ?? 'Created');
}

export function sendNoContent(res: Response) {
  return res.status(204).send();
}

export function sendError(res: Response, status: number, error: string, details?: unknown) {
  const body: Record<string, unknown> = { success: false, error };
  if (details) body.details = details;
  return res.status(status).json(body);
}

export function sendValidationError(res: Response, issues: unknown) {
  return sendError(res, 400, 'Validation failed', issues);
}

export function sendUnauthorized(res: Response, message = 'Authentication required') {
  return sendError(res, 401, message);
}

export function sendForbidden(res: Response, message = 'Insufficient permissions') {
  return sendError(res, 403, message);
}

export function sendNotFound(res: Response, message = 'Resource not found') {
  return sendError(res, 404, message);
}

export function sendConflict(res: Response, message = 'Resource already exists') {
  return sendError(res, 409, message);
}

export function sendInternalError(res: Response, message = 'Internal server error') {
  return sendError(res, 500, message);
}
