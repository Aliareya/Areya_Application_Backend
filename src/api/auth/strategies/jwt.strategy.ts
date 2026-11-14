import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ConfigService } from '@nestjs/config';

import { User, SystemRole } from '../../../api/users/entities/user.entity';
import { UserRole } from '../../../api/users/entities/user-role.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,

    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => request?.cookies?.areya_access ?? null,
      ]),

      ignoreExpiration: false,

      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string }) {
    if (!payload?.sub || !/^\d+$/.test(payload.sub)) {
      throw new UnauthorizedException('توکن احراز هویت معتبر نیست.');
    }

    const user = await this.userRepository.findOne({
      where: {
        id: payload.sub,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        systemRole: true,
        isActive: true,
        shopId: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('حساب کاربری پیدا نشد.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('حساب کاربری شما غیرفعال است.');
    }

    let role: {
      id: string;
      name: string;
      slug: string;
      shopId: string;
    } | null = null;

    let permissions: string[] = [];

    if (
      user.systemRole === SystemRole.EMPLOYEE ||
      user.systemRole === SystemRole.STUDENT
    ) {
      if (!user.shopId) {
        throw new UnauthorizedException('دکان حساب کاربری مشخص نیست.');
      }

      const userRole = await this.userRoleRepository.findOne({
        where: {
          userId: user.id,
          shopId: user.shopId,
        },
        relations: {
          role: {
            rolePermissions: {
              permission: true,
            },
          },
        },
      });

      if (!userRole || !userRole.role) {
        throw new UnauthorizedException(
          'برای حساب کاربری شما نقشی تعیین نشده است.',
        );
      }

      if (
        userRole.shopId !== user.shopId ||
        userRole.role.shopId !== user.shopId ||
        userRole.roleId !== userRole.role.id
      ) {
        throw new UnauthorizedException('ارتباط نقش و دکان معتبر نیست.');
      }

      role = {
        id: userRole.role.id,
        name: userRole.role.name,
        slug: userRole.role.slug,
        shopId: userRole.role.shopId,
      };

      permissions = [
        ...new Set(
          (userRole.role.rolePermissions ?? [])
            .map((item) => item.permission?.slug)
            .filter(
              (slug): slug is string =>
                typeof slug === 'string' && slug.length > 0,
            ),
        ),
      ];
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      systemRole: user.systemRole,
      shopId: user.shopId,

      role,
      permissions,
    };
  }
}
