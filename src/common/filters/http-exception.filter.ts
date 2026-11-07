import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let errors: { field: string; message: string }[] = [];

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();

      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const errorResponse = exceptionResponse as {
          message?: string | string[];
          errors?: { field: string; message: string }[];
        };

        message = errorResponse.message ?? 'Request failed';
        errors = errorResponse.errors ?? [];
      }
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      errors,
    });
  }
}