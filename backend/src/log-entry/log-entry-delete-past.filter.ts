import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { LogEntryDeletePastError } from './log-entry-delete-past.error.js';

@Catch(LogEntryDeletePastError)
export class LogEntryDeletePastFilter implements ExceptionFilter {
  catch(exception: LogEntryDeletePastError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: exception.message,
    });
  }
}
