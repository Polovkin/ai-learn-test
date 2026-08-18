import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

interface LoginBody {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginBody, @Res({ passthrough: true }) res: Response) {
    console.log('[AUTH] Login requested');

    const result = await this.authService.login(body.email, body.password);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/auth'
    });

    console.log('[AUTH] Login success');

    return {
      accessToken: result.accessToken,
      user: result.user
    };
  }

  @Post('refresh')
  async refresh(@Req() req: Request) {
    console.log('[AUTH] Refresh requested');

    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      console.log('[AUTH] Refresh failed: missing cookie');
      throw new UnauthorizedException('Missing refresh token');
    }

    const payload = this.authService.verifyRefreshToken(refreshToken);
    const accessToken = this.authService.signAccessToken(payload.sub, payload.email);

    console.log('[AUTH] Refresh success');
    return { accessToken };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    console.log('[AUTH] Logout requested');
    res.clearCookie('refreshToken', { path: '/auth' });
    console.log('[AUTH] Logout success');
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request & { user: { userId: number; email: string } }) {
    return {
      id: req.user.userId,
      email: req.user.email
    };
  }
}
