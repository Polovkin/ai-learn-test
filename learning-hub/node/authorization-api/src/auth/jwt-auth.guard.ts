import {
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = { userId: number; email: string }>(
    err: unknown,
    user: TUser,
    _info: unknown,
    context: ExecutionContext,
    _status?: unknown
  ): TUser {
    const request = context.switchToHttp().getRequest<Request>();

    if (!request.headers.authorization) {
      console.log('[AUTH] Access token missing');
      throw new UnauthorizedException('Access token missing');
    }

    if (err || !user) {
      console.log('[AUTH] Access token invalid or expired');
      throw err || new UnauthorizedException('Access token invalid or expired');
    }

    return user;
  }
}
