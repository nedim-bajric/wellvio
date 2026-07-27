import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { WeightLogNotFoundError } from './weight-log-not-found.error.js';

@Catch(WeightLogNotFoundError)
export class WeightLogNotFoundFilter implements ExceptionFilter {
  catch(exception: WeightLogNotFoundError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response.status(HttpStatus.NOT_FOUND).json({
      statusCode: HttpStatus.NOT_FOUND,
      message: exception.message,
    });
  }
}
