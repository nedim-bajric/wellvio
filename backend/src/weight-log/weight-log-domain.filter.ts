import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ActivePlanRequiredError } from './weight-log-domain.error.js';

@Catch(ActivePlanRequiredError)
export class ActivePlanRequiredFilter implements ExceptionFilter {
  catch(exception: ActivePlanRequiredError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: exception.message,
    });
  }
}
