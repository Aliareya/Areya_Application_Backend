
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
        message: 'Invalid email/phone or password',
        errors: [],
      });
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException({
        message: 'Invalid email/phone or password',
        errors: [],
      });
    }

    if (!user.isActive) {
      throw new ForbiddenException({
        message: 'Your account is inactive',
        errors: [],
      });
    }

    const payload = {
      sub: user.id,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const { password, ...result } = user;

    return {
      user: result,
      accessToken,
    };
  }

  async logout(token: string): Promise<void> {
    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }

    const payload = await this.jwtService.verifyAsync<{
      exp: number;
    }>(token);

    const expiresAt = new Date(payload.exp * 1000);

    await this.revokedTokensService.revoke(token, expiresAt);
  }
}
