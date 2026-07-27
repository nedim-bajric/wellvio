import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  HealthDisclaimerRequiredError,
  ProfileNotFoundError,
  UnsafePlanError,
} from './onboarding.errors.js';

@Catch(ProfileNotFoundError, UnsafePlanError, HealthDisclaimerRequiredError)
export class OnboardingErrorFilter implements ExceptionFilter {
  catch(
    exception:
      ProfileNotFoundError | UnsafePlanError | HealthDisclaimerRequiredError,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof ProfileNotFoundError) {
      response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: exception.message,
      });
      return;
    }

    if (exception instanceof UnsafePlanError) {
      const body: {
        statusCode: number;
        message: string;
        minimumSafeDays?: number;
      } = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: exception.message,
      };
      if (
        exception.minimumSafeDays !== undefined &&
        Number.isFinite(exception.minimumSafeDays)
      ) {
        body.minimumSafeDays = exception.minimumSafeDays;
      }
      response.status(HttpStatus.BAD_REQUEST).json(body);
      return;
    }

    // HealthDisclaimerRequiredError
    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: exception.message,
    });
  }
}
