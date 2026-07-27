import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  UseFilters,
} from '@nestjs/common';
import { WeightLogService } from './weight-log.service.js';
import { WeightLogNotFoundError } from './weight-log-not-found.error.js';
import { WeightLogNotFoundFilter } from './weight-log-not-found.filter.js';
import { ActivePlanRequiredFilter } from './weight-log-domain.filter.js';
import type {
  CreateWeightLogData,
  PlanAdjustmentSuggestion,
  UpdateWeightLogData,
  WeightLog,
  WeightTrendAnalysis,
} from './weight-log.types.js';
import { Plan } from '../onboarding/onboarding.types.js';

class ApplyAdjustmentDto {
  rate: Plan['rate'];
}

@Controller('weight-logs')
@UseFilters(WeightLogNotFoundFilter, ActivePlanRequiredFilter)
export class WeightLogController {
  constructor(private readonly weightLogService: WeightLogService) {}

  @Post()
  create(
    @Headers('x-user-id') userId: string,
    @Body() data: CreateWeightLogData,
  ): Promise<WeightLog> {
    return this.weightLogService.create(userId, data);
  }

  @Get()
  findAll(@Headers('x-user-id') userId: string): Promise<WeightLog[]> {
    return this.weightLogService.findAll(userId);
  }

  @Get('trend')
  analyzeTrend(
    @Headers('x-user-id') userId: string,
  ): Promise<WeightTrendAnalysis> {
    return this.weightLogService.analyzeTrend(userId);
  }

  @Get('adjustment-suggestion')
  suggestAdjustment(
    @Headers('x-user-id') userId: string,
  ): Promise<PlanAdjustmentSuggestion> {
    return this.weightLogService.suggestAdjustment(userId);
  }

  @Post('apply-adjustment')
  applyAdjustment(
    @Headers('x-user-id') userId: string,
    @Body() dto: ApplyAdjustmentDto,
  ): Promise<Plan> {
    return this.weightLogService.applyAdjustment(userId, dto.rate);
  }

  @Get(':id')
  async findOne(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ): Promise<WeightLog> {
    const entry = await this.weightLogService.findOne(userId, id);
    if (!entry) {
      throw new WeightLogNotFoundError(id);
    }
    return entry;
  }

  @Patch(':id')
  update(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() data: UpdateWeightLogData,
  ): Promise<WeightLog> {
    return this.weightLogService.update(userId, id, data);
  }

  @Delete(':id')
  remove(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.weightLogService.remove(userId, id);
  }
}
