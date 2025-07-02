import { Request, Response } from 'express';
import { cuid } from '../../libs/cuid';

export abstract class BaseController {
  protected createSuccessResponse(
    res: Response, 
    message: string, 
    data: any, 
    statusCode: number = 200
  ) {
    res.status(statusCode).json({
      message,
      requestId: cuid(),
      data,
      code: 0
    });
  }

  protected createErrorResponse(
    res: Response, 
    message: string, 
    statusCode: number = 400
  ) {
    res.status(statusCode).json({
      message,
      requestId: cuid(),
      data: null,
      code: 1
    });
  }

  protected parseRequestData(req: Request): any {
    if (!req.body || typeof req.body !== 'object' || Object.keys(req.body).length === 0) {
      throw new Error('Request data is required');
    }

    // If body has data field, use that, otherwise use the whole body
    if (req.body.data) {
      try {
        return typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
      } catch {
        return req.body;
      }
    }
    
    return req.body;
  }

  protected checkAuthentication(req: Request) {
    if (!req.user) {
      throw new Error('Authentication required');
    }
    return req.user;
  }

  protected extractFiles(req: Request, fieldNames: string[]) {
    const files = req.files as Express.Multer.File[];
    if (!files) return {};

    const result: Record<string, Express.Multer.File | Express.Multer.File[]> = {};
    
    fieldNames.forEach(fieldName => {
      const matchingFiles = files.filter(f => 
        f.fieldname === fieldName || f.fieldname.startsWith(fieldName)
      );
      
      if (matchingFiles.length === 1) {
        result[fieldName] = matchingFiles[0];
      } else if (matchingFiles.length > 1) {
        result[fieldName] = matchingFiles;
      }
    });

    return result;
  }

  protected handleAsyncError(
    res: Response, 
    error: any, 
    defaultMessage: string = 'An error occurred',
    defaultStatusCode: number = 400
  ) {
    const message = error.message || defaultMessage;
    const statusCode = this.getErrorStatusCode(error, defaultStatusCode);
    this.createErrorResponse(res, message, statusCode);
  }

  private getErrorStatusCode(error: any, defaultStatusCode: number): number {
    if (error.message === 'Authentication required') return 401;
    if (error.message === 'Product not found' || error.message.includes('not found')) return 404;
    if (error.message.includes('validation') || error.message.includes('invalid')) return 400;
    return defaultStatusCode;
  }
} 