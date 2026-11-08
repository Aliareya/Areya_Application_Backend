
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

import { JwtService } from '@nestjs/jwt';
import { RevokedTokensService } from './revoked-tokens.service';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly revokedTokensService: RevokedTokensService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByIdentifierWithPassword(
      loginDto.identifier,
    );

    if (!user) {
      throw new UnauthorizedException({
        message: 'ایمیل یا شماره تماس و رمز عبور نادرست است.',
        errors: [],
      });
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException({
        message: 'ایمیل یا شماره تماس و رمز عبور نادرست است.',
        errors: [],
      });
    }

    if (!user.isActive) {
      throw new ForbiddenException({
        message: 'حساب کاربری شما غیرفعال است.',
        errors: [],
      });
    }

    const payload = {
      sub: user.id,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    // دریافت آخرین اطلاعات کاربر و دسترسی‌های او
    const profile = await this.userService.getAuthProfile(user.id);
    
    return {
      user: profile.user,
      role: profile.role,
      permissions: profile.permissions,
      accessToken,
    };
  }
  
  async getProfile(userId: string) {
    const profile = await this.userService.getAuthProfile(userId);
     return {
      user: profile.user,
      role: profile.role,
      permissions: profile.permissions,
    };
  }

  async logout(token: string): Promise<void> {
    if (!token) {
      throw new UnauthorizedException(
        'برای انجام این عملیات، ابتدا وارد حساب کاربری شوید.',
      );
    }

    const payload = await this.jwtService.verifyAsync<{
      exp: number;
    }>(token);

    const expiresAt = new Date(payload.exp * 1000);

    await this.revokedTokensService.revoke(token, expiresAt);
  }
}
