import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

import { UsersService } from '../users/users.service';
import { RevokedTokensService } from './revoked-tokens.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly revokedTokensService: RevokedTokensService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.areya_access,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: { sub: string }) {
    const token = request.cookies?.areya_access;

    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }

    const isRevoked = await this.revokedTokensService.isRevoked(token);

    if (isRevoked) {
      throw new UnauthorizedException('Token has been revoked');
    }

    const user = await this.usersService.findUserById(payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid user');
    }

    return user;
  }
}
