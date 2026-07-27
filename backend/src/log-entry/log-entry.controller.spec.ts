import { Test, TestingModule } from '@nestjs/testing';
import { LogEntryController } from './log-entry.controller.js';
import { LogEntryService } from './log-entry.service.js';
import { LogEntryNotFoundError } from './log-entry-not-found.error.js';
import type { LogEntry } from './log-entry.types.js';

describe('LogEntryController', () => {
  let controller: LogEntryController;
  let service: LogEntryService;
  const userId = 'user-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogEntryController],
      providers: [
        {
          provide: LogEntryService,
          useValue: {
            create: jest.fn(),
            findAllByDate: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            getDailyDashboard: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<LogEntryController>(LogEntryController);
    service = module.get<LogEntryService>(LogEntryService);
  });

  function makeEntry(): LogEntry {
    const now = new Date();
    return {
      id: 'entry-1',
      userId,
      foodId: 'food-1',
      foodName: 'Apple',
      grams: 100,
      nutrients: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
      mealSlot: 'breakfast',
      loggedAt: now,
      createdAt: now,
      updatedAt: now,
    };
  }

  describe('create', () => {
    it('creates a log entry for the user', async () => {
      const created = makeEntry();
      jest.spyOn(service, 'create').mockResolvedValue(created);

      const data = { foodId: 'food-1', grams: 100, mealSlot: 'breakfast' as const };
      const result = await controller.create(userId, data);

      expect(service.create).toHaveBeenCalledWith(userId, data);
      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('lists entries for today by default', async () => {
      const entries = [makeEntry()];
      jest.spyOn(service, 'findAllByDate').mockResolvedValue(entries);

      const result = await controller.findAll(userId);

      expect(service.findAllByDate).toHaveBeenCalledWith(userId, expect.any(Date));
      expect(result).toEqual(entries);
    });

    it('lists entries for the requested date', async () => {
      const entries = [makeEntry()];
      jest.spyOn(service, 'findAllByDate').mockResolvedValue(entries);

      const result = await controller.findAll(userId, '2026-07-27');

      expect(service.findAllByDate).toHaveBeenCalledWith(
        userId,
        new Date('2026-07-27T00:00:00Z'),
      );
      expect(result).toEqual(entries);
    });
  });

  describe('getDashboard', () => {
    it('returns the daily dashboard', async () => {
      const dashboard = {
        date: '2026-07-27T00:00:00.000Z',
        totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        targets: null,
        remaining: null,
        mealSlots: [],
      };
      jest.spyOn(service, 'getDailyDashboard').mockResolvedValue(dashboard);

      const result = await controller.getDashboard(userId, '2026-07-27');

      expect(service.getDailyDashboard).toHaveBeenCalledWith(
        userId,
        new Date('2026-07-27T00:00:00Z'),
      );
      expect(result).toEqual(dashboard);
    });
  });

  describe('findOne', () => {
    it('returns a single entry', async () => {
      const entry = makeEntry();
      jest.spyOn(service, 'findOne').mockResolvedValue(entry);

      const result = await controller.findOne(userId, 'entry-1');

      expect(service.findOne).toHaveBeenCalledWith(userId, 'entry-1');
      expect(result).toEqual(entry);
    });

    it('throws LogEntryNotFoundError when the entry is missing', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(controller.findOne(userId, 'entry-1')).rejects.toThrow(
        LogEntryNotFoundError,
      );
    });
  });

  describe('update', () => {
    it('updates an entry for the user', async () => {
      const updated = makeEntry();
      jest.spyOn(service, 'update').mockResolvedValue(updated);

      const result = await controller.update(userId, 'entry-1', { grams: 200 });

      expect(service.update).toHaveBeenCalledWith(userId, 'entry-1', { grams: 200 });
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('deletes an entry for the user', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await controller.remove(userId, 'entry-1');

      expect(service.remove).toHaveBeenCalledWith(userId, 'entry-1');
    });
  });
});
