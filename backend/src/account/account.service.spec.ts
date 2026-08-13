import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service.js';
import { FoodService } from '../food/food.service.js';
import { LogEntryService } from '../log-entry/log-entry.service.js';
import { OnboardingService } from '../onboarding/onboarding.service.js';
import { WeightLogService } from '../weight-log/weight-log.service.js';

describe('AccountService', () => {
  let service: AccountService;
  let foodService: FoodService;
  let logEntryService: LogEntryService;
  let weightLogService: WeightLogService;
  let onboardingService: OnboardingService;
  const userId = 'user-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: FoodService,
          useValue: { removeAllByUserId: jest.fn() },
        },
        {
          provide: LogEntryService,
          useValue: { removeAllByUserId: jest.fn() },
        },
        {
          provide: WeightLogService,
          useValue: { removeAllByUserId: jest.fn() },
        },
        {
          provide: OnboardingService,
          useValue: { deleteAccount: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    foodService = module.get<FoodService>(FoodService);
    logEntryService = module.get<LogEntryService>(LogEntryService);
    weightLogService = module.get<WeightLogService>(WeightLogService);
    onboardingService = module.get<OnboardingService>(OnboardingService);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  describe('deleteAccount', () => {
    it('deletes all user data across services', async () => {
      jest.spyOn(foodService, 'removeAllByUserId').mockResolvedValue(undefined);
      jest.spyOn(logEntryService, 'removeAllByUserId').mockResolvedValue(undefined);
      jest.spyOn(weightLogService, 'removeAllByUserId').mockResolvedValue(undefined);
      jest.spyOn(onboardingService, 'deleteAccount').mockResolvedValue(undefined);

      await service.deleteAccount(userId);

      expect(logEntryService.removeAllByUserId).toHaveBeenCalledWith(userId);
      expect(foodService.removeAllByUserId).toHaveBeenCalledWith(userId);
      expect(weightLogService.removeAllByUserId).toHaveBeenCalledWith(userId);
      expect(onboardingService.deleteAccount).toHaveBeenCalledWith(userId);
    });
  });
});
