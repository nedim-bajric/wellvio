import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller.js';
import { AccountService } from './account.service.js';

describe('AccountController', () => {
  let controller: AccountController;
  let service: AccountService;
  const userId = 'user-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useValue: { deleteAccount: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
    service = module.get<AccountService>(AccountService);
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  describe('deleteAccount', () => {
    it('deletes the account for the user', async () => {
      jest.spyOn(service, 'deleteAccount').mockResolvedValue(undefined);

      const result = await controller.deleteAccount(userId);

      expect(service.deleteAccount).toHaveBeenCalledWith(userId);
      expect(result).toEqual({ deleted: true });
    });
  });
});
