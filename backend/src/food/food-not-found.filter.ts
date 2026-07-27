import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { FoodNotFoundError } from './food-not-found.error.js';

@Catch(FoodNotFoundError)
export class FoodNotFoundFilter implements ExceptionFilter {
  catch(_exception: FoodNotFoundError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    response.status(404).json({
      statusCode: 404,
      message: 'Food not found',
    });
  }
}
