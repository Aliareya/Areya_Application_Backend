import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  UnauthorizedException,
  Get,
} from '@nestjs/common';

import { Response } from 'express';

import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { AuthenticatedRequest } from '../.././common/interfaces/authenticated-request.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Register
  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  // Login
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user, role, permissions, accessToken } =
      await this.authService.login(loginDto);

    response.cookie('areya_access', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: 12 * 60 * 60 * 1000,
    });

    return {
      success: true,
      message: 'Login successful',
      user: {
        ...user,
        role,
        permissions,
      },
    };
  }

  // Logout
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = request.cookies?.areya_access;

    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }

    await this.authService.logout(token);

    response.clearCookie('areya_access', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });

    return {
      success: true,
      message: 'Logout successful',
    };
  }

  // Get authenticated user profile
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async me(@Req() request: AuthenticatedRequest) {
    const profile = await this.authService.getProfile(request.user.id);

    return {
      user: {
        ...profile.user,
        role: profile.role,
        permissions: profile.permissions,
      },
      success: true,
      message: 'User information retrieved successfully',
    };
  }
}
