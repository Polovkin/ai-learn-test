import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProtectedModule } from './protected/protected.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, ProtectedModule, WalletModule]
})
export class AppModule {}
