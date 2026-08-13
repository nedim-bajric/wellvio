import { Controller, Delete, Headers } from '@nestjs/common';
import { AccountService } from './account.service.js';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Delete()
  async deleteAccount(
    @Headers('x-user-id') userId: string,
  ): Promise<{ deleted: boolean }> {
    await this.accountService.deleteAccount(userId);
    return { deleted: true };
  }
}
