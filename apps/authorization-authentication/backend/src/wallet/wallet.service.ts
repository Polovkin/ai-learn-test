import { BadRequestException, Injectable } from '@nestjs/common';

const INITIAL_BALANCE = 100;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class WalletService {
  private state = {
    balance: INITIAL_BALANCE
  };

  getBalance() {
    return this.state.balance;
  }

  resetBalance() {
    this.state.balance = INITIAL_BALANCE;
    return this.state.balance;
  }

  async withdrawWithoutMutex(amount: number) {
    console.log(`withdraw started, amount: ${amount}`);

    const currentBalance = this.state.balance;
    console.log(`currentBalance read: ${currentBalance}`);

    await delay(300);

    if (currentBalance < amount) {
      throw new BadRequestException('Insufficient funds');
    }

    const newBalance = currentBalance - amount;
    console.log(`newBalance calculated: ${newBalance}`);

    await delay(300);

    this.state.balance = newBalance;
    console.log(`balance written: ${this.state.balance}`);

    return this.state.balance;
  }
}
