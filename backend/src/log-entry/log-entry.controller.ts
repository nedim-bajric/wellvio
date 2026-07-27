import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
} from '@nestjs/common';
import { LogEntryService } from './log-entry.service.js';
import { LogEntryNotFoundError } from './log-entry-not-found.error.js';
import { LogEntryNotFoundFilter } from './log-entry-not-found.filter.js';
import type {
  CreateLogEntryData,
  DailyDashboard,
  LogEntry,
  UpdateLogEntryData,
} from './log-entry.types.js';

@Controller('log-entries')
@UseFilters(LogEntryNotFoundFilter)
export class LogEntryController {
  constructor(private readonly logEntryService: LogEntryService) {}

  @Post()
  create(
    @Headers('x-user-id') userId: string,
    @Body() data: CreateLogEntryData,
  ): Promise<LogEntry> {
    return this.logEntryService.create(userId, data);
  }

  @Get()
  findAll(
    @Headers('x-user-id') userId: string,
    @Query('date') date?: string,
  ): Promise<LogEntry[]> {
    return this.logEntryService.findAllByDate(
      userId,
      date ? new Date(date) : new Date(),
    );
  }

  @Get('dashboard')
  getDashboard(
    @Headers('x-user-id') userId: string,
    @Query('date') date?: string,
  ): Promise<DailyDashboard> {
    return this.logEntryService.getDailyDashboard(
      userId,
      date ? new Date(date) : new Date(),
    );
  }

  @Get(':id')
  async findOne(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ): Promise<LogEntry> {
    const entry = await this.logEntryService.findOne(userId, id);
    if (!entry) {
      // The filter maps this to 404.
      throw new LogEntryNotFoundError(id);
    }
    return entry;
  }

  @Patch(':id')
  update(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() data: UpdateLogEntryData,
  ): Promise<LogEntry> {
    return this.logEntryService.update(userId, id, data);
  }

  @Delete(':id')
  remove(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.logEntryService.remove(userId, id);
  }
}
