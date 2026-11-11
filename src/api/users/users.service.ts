import {
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { SystemRole, User } from './entities/user.entity';
import { UserRole } from './entities/user-role.entity';

import { Role } from '../roles/entities/role.entity';
import { Shop, ShopStatus } from '../shops/entities/shop.entity';

import * as bcrypt from 'bcrypt';
import { UserResponseDto } from './dto/user-response.dto';
import { AssignUserRoleDto } from './dto/assign-user-role.dto';
import { Store } from '../stores/entities/store.entity';
import { CreateShopUserDto } from './dto/create-shop-employee.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    if (createUserDto.phone) {
      const phoneChecked = await this.userRepository.findOne({
        where: { phone: createUserDto.phone },
      });
      if (phoneChecked) {
        throw new ConflictException(
          'User with this phone number already exists',
        );
      }
    }

    if (createUserDto.email) {
      const normalizedEmail = createUserDto.email?.trim().toLowerCase() ?? null;
      const emailChecked = await this.userRepository.findOne({
        where: { email: normalizedEmail },
      });
      if (emailChecked) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const normalizedEmail = createUserDto.email?.trim().toLowerCase() ?? null;
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      fullName: createUserDto.fullName,
      phone: createUserDto.phone,
      email: normalizedEmail ?? null,
      password: hashedPassword,
      systemRole: SystemRole.USER,
      shopId: null,
      isActive: true,
    });

    try {
      const savedUser = await this.userRepository.save(user);

      const { password, ...result } = savedUser;

      return result;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const dbError = error.driverError as {
          code?: string;
          constraint?: string;
        };

        if (dbError.code === '23505') {
          if (dbError.constraint === 'UQ_users_phone') {
            throw new ConflictException({
              message: 'Phone number already exists',
              errors: [
                {
                  field: 'phone',
                  message: 'This phone number is already registered',
                },
              ],
            });
          }

          if (dbError.constraint === 'UQ_users_email') {
            throw new ConflictException({
              message: 'Email already exists',
              errors: [
                {
                  field: 'email',
                  message: 'This email is already registered',
                },
              ],
            });
          }
        }
      }

      throw error;
    }
  }

  async findByIdentifierWithPassword(identifier: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where(
        'user.phone = :identifier OR LOWER(user.email) = LOWER(:identifier)',
        { identifier },
      )
      .getOne();
  }

  async findUserById(id: string) {
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async assignRole(
    actorId: string,
    shopId: string,
    userId: string,
    assignUserRoleDto: AssignUserRoleDto,
  ) {
    // Validate BIGINT IDs
    if (
      !/^[1-9]\d*$/.test(actorId) ||
      !/^[1-9]\d*$/.test(shopId) ||
      !/^[1-9]\d*$/.test(userId) ||
      !/^[1-9]\d*$/.test(assignUserRoleDto.roleId)
    ) {
      throw new BadRequestException('شناسه واردشده نامعتبر است.');
    }

    return this.dataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(User);
      const shopRepository = manager.getRepository(Shop);
      const roleRepository = manager.getRepository(Role);
      const userRoleRepository = manager.getRepository(UserRole);

      // 1. Check shop owner
      const owner = await userRepository.findOne({
        where: {
          id: actorId,
          systemRole: SystemRole.OWNER,
          isActive: true,
        },
      });

      if (!owner) {
        throw new ForbiddenException('شما اجازه اختصاص نقش را ندارید.');
      }

      // 2. Check shop ownership and status
      const shop = await shopRepository.findOne({
        where: { id: shopId },
        relations: { store: true },
      });

      if (!shop || shop.store.ownerId !== owner.id) {
        throw new NotFoundException('دکان پیدا نشد یا شما مالک آن نیستید.');
      }

      if (shop.status !== ShopStatus.ACTIVE) {
        throw new ForbiddenException(
          'اختصاص نقش در دکان غیرفعال امکان‌پذیر نیست.',
        );
      }

      // 3. Find employee
      const employee = await userRepository.findOne({
        where: {
          id: userId,
          systemRole: SystemRole.EMPLOYEE,
          shopId,
        },
      });

      if (!employee) {
        throw new NotFoundException('کارمند در این دکان پیدا نشد.');
      }

      if (!employee.isActive) {
        throw new ForbiddenException(
          'برای کارمند غیرفعال نمی‌توان نقش تعیین کرد.',
        );
      }

      // 4. Check role belongs to the same shop
      const role = await roleRepository.findOne({
        where: {
          id: assignUserRoleDto.roleId,
          shopId,
        },
      });

      if (!role) {
        throw new NotFoundException('نقش مورد نظر در این دکان پیدا نشد.');
      }

      // 5. Find existing user role
      let userRole = await userRoleRepository.findOne({
        where: { userId },
      });

      if (userRole) {
        // Replace existing role
        userRole.roleId = role.id;
        userRole.shopId = shopId;
      } else {
        // Assign new role
        userRole = userRoleRepository.create({
          userId,
          roleId: role.id,
          shopId,
        });
      }

      await userRoleRepository.save(userRole);

      return {
        success: true,
        message: 'نقش با موفقیت به کارمند اختصاص داده شد.',
        assignment: {
          userId: employee.id,
          employeeName: employee.fullName,
          shopId,
          roleId: role.id,
          roleName: role.name,
        },
      };
    });
  }

  async getEmployeeRole(actorId: string, shopId: string, userId: string) {
    if (
      !/^[1-9]\d*$/.test(actorId) ||
      !/^[1-9]\d*$/.test(shopId) ||
      !/^[1-9]\d*$/.test(userId)
    ) {
      throw new BadRequestException('شناسه واردشده نامعتبر است.');
    }

    // 1. Check shop owner
    const owner = await this.userRepository.findOne({
      where: {
        id: actorId,
        systemRole: SystemRole.OWNER,
        isActive: true,
      },
    });

    if (!owner) {
      throw new ForbiddenException('شما اجازه مشاهده این اطلاعات را ندارید.');
    }

    // 2. Check shop ownership
    const shop = await this.dataSource.getRepository(Shop).findOne({
      where: { id: shopId },
      relations: { store: true },
    });

    if (!shop || shop.store.ownerId !== owner.id) {
      throw new NotFoundException('دکان پیدا نشد یا شما مالک آن نیستید.');
    }

    if (shop.status !== ShopStatus.ACTIVE) {
      throw new ForbiddenException('دکان غیرفعال است.');
    }

    // 3. Find employee
    const employee = await this.userRepository.findOne({
      where: {
        id: userId,
        systemRole: SystemRole.EMPLOYEE,
        shopId,
      },
    });

    if (!employee) {
      throw new NotFoundException('کارمند در این دکان پیدا نشد.');
    }

    // 4. Find assigned role and permissions
    const userRole = await this.dataSource.getRepository(UserRole).findOne({
      where: {
        userId,
        shopId,
      },
      relations: {
        role: {
          rolePermissions: {
            permission: true,
          },
        },
      },
    });

    if (!userRole) {
      throw new NotFoundException('برای این کارمند نقشی تعیین نشده است.');
    }

    return {
      success: true,
      employee: {
        id: employee.id,
        fullName: employee.fullName,
        shopId: employee.shopId,
      },
      role: {
        id: userRole.role.id,
        name: userRole.role.name,
        slug: userRole.role.slug,
        permissions: userRole.role.rolePermissions.map((item) => ({
          id: item.permission.id,
          name: item.permission.name,
          slug: item.permission.slug,
          description: item.permission.description,
        })),
      },
    };
  }

  async getAuthProfile(userId: string) {
    if (!userId || !/^\d+$/.test(userId)) {
      throw new BadRequestException('شناسه کاربر معتبر نیست.');
    }

    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('کاربر مورد نظر پیدا نشد.');
    }

    if (!user.isActive) {
      throw new ForbiddenException('حساب کاربری شما غیرفعال است.');
    }

    let role: any = null;
    let permissions: any[] = [];

    let userRole: any = null;

    if (user.systemRole === SystemRole.EMPLOYEE || user.systemRole === SystemRole.STUDENT) {
      userRole = await this.userRoleRepository.findOne({
        where: {
          userId: user.id,
        },
        relations: {
          role: true,
        },
      });

      if (userRole) {
        role = {
          id: userRole.role.id,
          name: userRole.role.name,
          description: userRole.role.description,
          shopId: userRole.shopId,
        };

        const rolePermissions = await this.dataSource
          .getRepository(Role)
          .createQueryBuilder('role')
          .leftJoinAndSelect('role.rolePermissions', 'rolePermission')
          .leftJoinAndSelect('rolePermission.permission', 'permission')
          .where('role.id = :roleId', {
            roleId: userRole.roleId,
          })
          .getOne();

        permissions =
          rolePermissions?.rolePermissions?.map((item) => ({
            id: item.permission.id,
            name: item.permission.name,
            slug: item.permission.slug,
            description: item.permission.description,
          })) ?? [];
      }
    }

    let userStore: Store | null = null;
    let userShop: Shop | null = null;

    if (user.systemRole === SystemRole.EMPLOYEE || user.systemRole === SystemRole.STUDENT) {
      const employeeShopId = user.shopId ?? userRole?.shopId ?? null;

      if (employeeShopId) {
        userShop = await this.dataSource.getRepository(Shop).findOne({
          where: {
            id: employeeShopId,
          },
          relations: {
            store: true,
          },
        });

        userStore = userShop?.store ?? null;
      }
    } else {
      userStore = await this.dataSource.getRepository(Store).findOne({
        where: {
          ownerId: user.id,
        },
      });
    }

    const store = userStore
      ? {
          id: userStore.id,
          name: userStore.name,
          slug: userStore.slug,
          phone: userStore.phone,
          address: userStore.address,
          logo: userStore.logo,
          status: userStore.status,
          creationStatus: userStore.creationStatus,
          createdAt: userStore.createdAt,
        }
      : null;

    const shop = userShop
      ? {
          id: userShop.id,
          name: userShop.name,
          slug: userShop.slug,
          phone: userShop.phone,
          address: userShop.address,
          status: userShop.status,
          createdAt: userShop.createdAt,
        }
      : null;

    const safeUser = {
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
      email: user.email,
      systemRole: user.systemRole,

      shopId:
        user.systemRole === SystemRole.EMPLOYEE
          ? (user.shopId ?? userRole?.shopId ?? null)
          : user.shopId,

      isActive: user.isActive,
      store,
      shop,
    };

    return {
      success: true,
      user: safeUser,
      role,
      permissions,
    };
  }

  async createShopEmployee(
    actorId: string,
    shopId: string,
    dto: CreateShopUserDto,
  ) {
    let stage = 'START';

    try {
      // ==========================================
      // 1. Validate input IDs
      // ==========================================

      stage = 'VALIDATE_IDS';

      if (
        !/^[1-9]\d*$/.test(actorId) ||
        !/^[1-9]\d*$/.test(shopId) ||
        !/^[1-9]\d*$/.test(dto.roleId)
      ) {
        throw new BadRequestException('شناسه واردشده نامعتبر است.');
      }

      // ==========================================
      // 2. Validate required fields
      // ==========================================

      stage = 'VALIDATE_FIELDS';

      if (
        !dto.fullName?.trim() ||
        !dto.phone?.trim() ||
        !dto.password ||
        !dto.systemRole ||
        !dto.roleId
      ) {
        throw new BadRequestException('تمام فیلدهای اجباری باید تکمیل شوند.');
      }

      if (![SystemRole.EMPLOYEE, SystemRole.STUDENT].includes(dto.systemRole)) {
        throw new BadRequestException('نوع کاربر باید مدیر یا شاگرد باشد.');
      }

      // ==========================================
      // 3. Hash password
      // ==========================================

      stage = 'HASH_PASSWORD';

      const hashedPassword = await bcrypt.hash(dto.password, 12);

      // ==========================================
      // 4. Database transaction
      // ==========================================

      return await this.dataSource.transaction(async (manager) => {
        const userRepository = manager.getRepository(User);
        const shopRepository = manager.getRepository(Shop);
        const roleRepository = manager.getRepository(Role);
        const userRoleRepository = manager.getRepository(UserRole);

        // ==========================================
        // 5. Verify authenticated owner
        // ==========================================

        stage = 'CHECK_OWNER';

        const owner = await userRepository.findOne({
          where: {
            id: actorId,
            systemRole: SystemRole.OWNER,
            isActive: true,
          },
        });

        if (!owner) {
          throw new ForbiddenException(
            'شما اجازه ایجاد کاربر در این دکان را ندارید.',
          );
        }

        // ==========================================
        // 6. Verify shop ownership
        // ==========================================

        stage = 'CHECK_SHOP';

        const shop = await shopRepository.findOne({
          where: {
            id: shopId,
          },
          relations: {
            store: true,
          },
        });

        if (!shop || !shop.store || shop.store.ownerId !== owner.id) {
          throw new NotFoundException('دکان پیدا نشد یا شما مالک آن نیستید.');
        }

        // ==========================================
        // 7. Check shop status
        // ==========================================

        stage = 'CHECK_SHOP_STATUS';

        if (shop.status !== ShopStatus.ACTIVE) {
          throw new ForbiddenException(
            'در دکان غیرفعال امکان ایجاد کاربر وجود ندارد.',
          );
        }

        // ==========================================
        // 8. Verify role belongs to this shop
        // ==========================================

        stage = 'CHECK_ROLE';

        const role = await roleRepository.findOne({
          where: {
            id: dto.roleId,
            shopId,
          },
        });

        if (!role) {
          throw new NotFoundException('نقش انتخاب‌شده در این دکان پیدا نشد.');
        }

        // ==========================================
        // 9. Normalize email
        // ==========================================

        stage = 'NORMALIZE_DATA';

        const normalizedEmail = dto.email?.trim().toLowerCase() || null;

        const normalizedFullName = dto.fullName.trim();

        // ==========================================
        // 10. Check duplicate phone
        // ==========================================

        stage = 'CHECK_DUPLICATE_PHONE';

        const existingPhone = await userRepository.findOne({
          where: {
            phone: dto.phone,
          },
          select: {
            id: true,
          },
        });

        if (existingPhone) {
          throw new ConflictException('این شماره تماس قبلاً ثبت شده است.');
        }

        // ==========================================
        // 11. Check duplicate email
        // ==========================================

        if (normalizedEmail) {
          stage = 'CHECK_DUPLICATE_EMAIL';

          const existingEmail = await userRepository.findOne({
            where: {
              email: normalizedEmail,
            },
            select: {
              id: true,
            },
          });

          if (existingEmail) {
            throw new ConflictException('این ایمیل قبلاً ثبت شده است.');
          }
        }

        // ==========================================
        // 12. Create user
        // ==========================================

        stage = 'CREATE_USER';

        const shopUser = userRepository.create({
          fullName: normalizedFullName,
          phone: dto.phone,
          email: normalizedEmail,
          password: hashedPassword,
          systemRole: dto.systemRole,
          shopId,
          isActive: true,
        });

        const savedUser = await userRepository.save(shopUser);

        // ==========================================
        // 13. Assign role to user
        // ==========================================

        stage = 'ASSIGN_USER_ROLE';

        const userRole = userRoleRepository.create({
          userId: savedUser.id,
          roleId: role.id,
          shopId,
        });

        await userRoleRepository.save(userRole);

        // ==========================================
        // 14. Return safe response
        // ==========================================

        stage = 'RETURN_RESPONSE';

        return {
          success: true,
          message: 'کاربر دکان با موفقیت ایجاد شد.',

          user: {
            id: savedUser.id,
            fullName: savedUser.fullName,
            phone: savedUser.phone,
            email: savedUser.email,
            systemRole: savedUser.systemRole,
            shopId: savedUser.shopId,
            isActive: savedUser.isActive,
            createdAt: savedUser.createdAt,
          },

          role: {
            id: role.id,
            name: role.name,
            slug: role.slug,
          },

          shop: {
            id: shop.id,
            name: shop.name,
          },
        };
      });
    } catch (error) {
      // ==========================================
      // 15. Log actual error
      // ==========================================

      console.error('\n======================================');
      console.error('[CREATE SHOP EMPLOYEE FAILED]');
      console.error('Stage:', stage);

      if (error instanceof Error) {
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Stack:', error.stack);
      } else {
        console.error('Unknown Error:', error);
      }

      if (error instanceof QueryFailedError) {
        console.error('Database Error:', error.driverError);
      }

      console.error('======================================\n');

      // ==========================================
      // 16. Handle duplicate database constraints
      // ==========================================

      if (error instanceof QueryFailedError) {
        const dbError = error.driverError as {
          code?: string;
          constraint?: string;
        };

        if (dbError.code === '23505') {
          const constraint = dbError.constraint ?? '';

          if (constraint.includes('phone')) {
            throw new ConflictException('این شماره تماس قبلاً ثبت شده است.');
          }

          if (constraint.includes('email')) {
            throw new ConflictException('این ایمیل قبلاً ثبت شده است.');
          }

          throw new ConflictException(
            'اطلاعات تکراری است و امکان ثبت آن وجود ندارد.',
          );
        }
      }

      throw error;
    }
  }
}
