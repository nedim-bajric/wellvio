import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ActivePlanRequiredError,
  AdjustmentRateMismatchError,
  InsufficientDataForAdjustmentError,
} from './weight-log-domain.error.js';

@Catch(
  ActivePlanRequiredError,
  InsufficientDataForAdjustmentError,
  AdjustmentRateMismatchError,
)
export class ActivePlanRequiredFilter implements ExceptionFilter {
  catch(
    exception:
      | ActivePlanRequiredError
      | InsufficientDataForAdjustmentError
      | AdjustmentRateMismatchError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: exception.message,
    });
  }
}
