import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login-user.dto';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);

    res.cookie('jwt', result.token, {
      httpOnly: true,
      secure: process.env.VERCEL === '1',
      sameSite: process.env.VERCEL === '1' ? 'none' : 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    const { token, user, ...responseWithoutToken } = result;
    return user;
  }

  @Get('me')
  async me(@Req() req: Request) {
    const token = req.cookies['jwt'];
    return this.authService.getMe(token);
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.VERCEL === '1',
      sameSite: process.env.VERCEL === '1' ? 'none' : 'lax',
      path: '/',
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'با موفقیت خارج شدید',
    };
  }
}
