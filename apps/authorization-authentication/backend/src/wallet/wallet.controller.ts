import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import { WalletService } from './wallet.service';

interface WithdrawBody {
  amount: unknown;
}

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  getBalance() {
    return {
      balance: this.walletService.getBalance()
    };
  }

  @Post('reset')
  resetBalance() {
    return {
      balance: this.walletService.resetBalance()
    };
  }

  @Post('withdraw-without-mutex')
  async withdrawWithoutMutex(@Body() body: WithdrawBody) {
    const amount = body?.amount;

    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('amount must be a positive number');
    }

    return {
      balance: await this.walletService.withdrawWithoutMutex(amount)
    };
  }
}
