import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

function delayMs() {
  return 300 + Math.floor(Math.random() * 501);
}

async function withDelay<T>(fn: () => T | Promise<T>) {
  const ms = delayMs();
  await new Promise((resolve) => setTimeout(resolve, ms));
  return fn();
}

@Controller()
@UseGuards(JwtAuthGuard)
export class ProtectedController {
  @Get('profile')
  async profile(@Req() req: Request & { user: { userId: number; email: string } }) {
    console.log('[PROTECTED] GET /profile called');
    return withDelay(() => ({
      id: req.user.userId,
      email: req.user.email,
      role: 'learner'
    }));
  }

  @Get('orders')
  async orders() {
    console.log('[PROTECTED] GET /orders called');
    return withDelay(() => ({
      items: [
        { id: 'order-1', status: 'pending' },
        { id: 'order-2', status: 'completed' }
      ]
    }));
  }

  @Get('notifications')
  async notifications() {
    console.log('[PROTECTED] GET /notifications called');
    return withDelay(() => ({
      items: [
        { id: 'notification-1', text: 'Access token demo notification' }
      ]
    }));
  }

  @Get('settings')
  async settings() {
    console.log('[PROTECTED] GET /settings called');
    return withDelay(() => ({
      theme: 'light',
      language: 'en'
    }));
  }
}
