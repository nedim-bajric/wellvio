import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { LogEntryNotFoundError } from './log-entry-not-found.error.js';

@Catch(LogEntryNotFoundError)
export class LogEntryNotFoundFilter implements ExceptionFilter {
  catch(exception: LogEntryNotFoundError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response.status(HttpStatus.NOT_FOUND).json({
      statusCode: HttpStatus.NOT_FOUND,
      message: exception.message,
    });
  }
}
