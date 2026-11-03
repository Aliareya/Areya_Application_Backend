import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login-user.dto';

import * as bcrypt from 'bcrypt';

import { toUserResponse } from '../users/utils/to-user-response';
import { JwtService } from '@nestjs/jwt';
import { SystemRole } from '../users/entities/user.entity';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly roleService: RolesService,
    private readonly jwtService: JwtService,
  ) {}

  // Register
  register(createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  /**
   * Build the same user response for login and getMe.
   */
  private async buildUserResponse(userId: number) {
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new UnauthorizedException('کاربر یافت نشد');
    }

    let role: {
      id: number;
      name: string;
      slug: string;
    } | null = null;

    let permissions: string[] = [];
    let workshopId: number | null = null;

    switch (user.systemRole) {
      // System administrator
      case SystemRole.ADMIN: {
        permissions = ['*'];
        break;
      }

      // Registered user without a workshop
      case SystemRole.USER: {
        permissions = [];
        break;
      }

      // Workshop owner or employee
      case SystemRole.CUSTOMER: {
        if (!user.workshop?.id) {
          throw new ForbiddenException(
            'این کاربر به هیچ کارگاهی مرتبط نیست',
          );
        }

        workshopId = user.workshop.id;

        const userRole =
          await this.userService.getUserRoleByWorkshop(
            user.id,
            workshopId,
          );

        if (!userRole) {
          throw new ForbiddenException(
            'برای این کاربر در کارگاه رول تعیین نشده است',
          );
        }

        if (userRole.workshop?.id !== workshopId) {
          throw new ForbiddenException(
            'این رول متعلق به کارگاه کاربر نیست',
          );
        }

        role = {
          id: userRole.id,
          name: userRole.name,
          slug: userRole.slug,
        };

        permissions = [
          ...new Set(
            (userRole.rolePermissions ?? [])
              .map((rp) => rp.permission?.slug)
              .filter(
                (slug): slug is string =>
                  typeof slug === 'string' &&
                  slug.length > 0,
              ),
          ),
        ];

        break;
      }

      default: {
        throw new UnauthorizedException(
          'نقش سیستم کاربر معتبر نیست',
        );
      }
    }

    return {
      ...toUserResponse(user),
      role,
      permissions,
    };
  }

  // Login
  async login(logonDto: LoginDto) {
    const user = await this.userService.getWithPassword(
      logonDto.email,
    );

    if (!user?.password) {
      throw new UnauthorizedException(
        'ایمیل یا رمز عبور نامعتبر است',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      logonDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'ایمیل یا رمز عبور نامعتبر است',
      );
    }

    // Build the same user structure used by getMe.
    const userResponse = await this.buildUserResponse(user.id);

    const payload = {
      user_id: user.id,
      sub: user.id,
      email: user.email,
      systemRole: user.systemRole,
      permissions: userResponse.permissions,
    };

    const expiresIn = Number(process.env.JWT_TIME) || '1d';

    const token = this.jwtService.sign(payload, {
      expiresIn,
    });

    return {
      message: 'ورود موفقیت‌آمیز',
      user: userResponse,
      token,
    };
  }

  // Get current authenticated user
  async getMe(token: string) {
    if (!token) {
      throw new UnauthorizedException(
        'لطفاً وارد حساب خود شوید',
      );
    }

    let payload: {
      sub: number | string;
      user_id?: number | string;
    };

    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException(
        'توکن نامعتبر یا منقضی شده است',
      );
    }

    const userId = Number(payload.user_id ?? payload.sub);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      throw new UnauthorizedException(
        'شناسه کاربر در توکن معتبر نیست',
      );
    }

    // Re-read current user and permissions from the database.
    const user = await this.buildUserResponse(userId);

    return user;
  }
}