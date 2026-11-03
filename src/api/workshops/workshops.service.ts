import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Workshop, WorkshopStatus } from './entities/workshop.entity';
import { DataSource, Repository } from 'typeorm';
import { SystemRole, User } from '../users/entities/user.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { Role } from '../roles/entities/role.entity';
import { RolePermission } from '../permissions/entities/role-permission.entity';
import { UsersService } from '../users/users.service';
import { CreateOwnerDto } from '../users/dto/create-owner-dto';

@Injectable()
export class WorkshopsService {
  constructor(
    @InjectRepository(Workshop)
    private readonly workshopRepository: Repository<Workshop>,

    private readonly userService: UsersService,

    private readonly dataSource: DataSource,
  ) {}

  async create(
    createWorkshopDto: CreateWorkshopDto,
    userPayload: { sub?: number; user_id?: number },
  ) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const userRepository = manager.getRepository(User);
        const workshopRepository = manager.getRepository(Workshop);
        const roleRepository = manager.getRepository(Role);
        const permissionRepository = manager.getRepository(Permission);
        const rolePermissionRepository = manager.getRepository(RolePermission);

        const userId = Number(userPayload.user_id ?? userPayload.sub);

        if (!Number.isSafeInteger(userId) || userId <= 0) {
          throw new BadRequestException('شناسه کاربر معتبر نیست.');
        }

        const foundUser = await userRepository.findOne({
          where: { id: userId },
          relations: {
            workshop: true,
          },
        });

        if (!foundUser) {
          throw new NotFoundException(
            'کاربر پیدا نشد. لطفاً دوباره وارد سیستم شوید.',
          );
        }

        if (foundUser.systemRole !== SystemRole.USER) {
          throw new ConflictException(
            'فقط کاربرانی بدون کارگاه می‌تواند کارگاه جدید ایجاد کند.',
          );
        }

        if (foundUser.workshop) {
          throw new ConflictException('شما از قبل عضو یک کارگاه هستید.');
        }

        // 3. بررسی تکراری نبودن نام کارگاه
        const existingWorkshop = await workshopRepository.findOne({
          where: {
            name: createWorkshopDto.name,
          },
        });

        if (existingWorkshop) {
          throw new ConflictException('کارگاهی با این نام از قبل وجود دارد.');
        }

        // 4. ایجاد کارگاه
        const newWorkshop = workshopRepository.create({
          ...createWorkshopDto,
          owner: foundUser,
          users: [foundUser],
        });

        // 5. دریافت تمام Permissionهای سیستم
        const allPermissions = await permissionRepository.find();

        // 6. ایجاد رول Owner مخصوص این کارگاه
        const savedWorkshop = await workshopRepository.save(newWorkshop);
        const ownerRole = roleRepository.create({
          name: 'Owner',
          slug: 'owner',
          workshop: savedWorkshop,
        });

        const savedOwnerRole = await roleRepository.save(ownerRole);

        // 7. اختصاص تمام Permissionها به Owner
        const rolePermissions = allPermissions.map((permission) =>
          rolePermissionRepository.create({
            role: savedOwnerRole,
            permission,
          }),
        );

        if (rolePermissions.length > 0) {
          await rolePermissionRepository.save(rolePermissions);
        }

        // 8. تبدیل سازنده کارگاه به CUSTOMER
        // و اختصاص کارگاه و رول Owner
        foundUser.systemRole = SystemRole.CUSTOMER;
        foundUser.workshop = savedWorkshop;
        foundUser.roleEntity = savedOwnerRole;

        await userRepository.save(foundUser);

        // 9. پاسخ
        return {
          message: 'کارگاه شما با موفقیت ایجاد شد.',
          workshop: savedWorkshop,
        };
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'خطایی در ایجاد کارگاه رخ داد. لطفاً بعداً دوباره تلاش کنید.',
      );
    }
  }

  async findAll() {
    try {
      const workshops = await this.workshopRepository.find({
        relations: {
          owner: true,
        },
        order: {
          createdAt: 'DESC',
        },
        select: {
          id: true,
          name: true,
          address: true,
          status: true,
          owner: {
            id: true,
            fullName: true,
          },
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        message: 'لیست تمام کارگاه‌ها با موفقیت دریافت شد.',
        count: workshops.length,
        workshops,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'خطایی در دریافت لیست کارگاه‌ها رخ داد. لطفاً بعداً دوباره تلاش کنید.',
      );
    }
  }

  async findOne(id: number) {
    try {
      const workshop = await this.workshopRepository.findOne({
        where: { id },
        relations: {
          owner: true,
          users: {
            roleEntity: true,
          },
        },
        select: {
          id: true,
          name: true,
          address: true,
          status: true,
          owner: {
            id: true,
          },
          createdAt: true,
          updatedAt: true,
          users: {
            id: true,
            fullName: true,
            phoneNumber: true,
            email: true,
            avatarUrl: true,
            lastLoginAt: true,
            roleEntity: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      if (!workshop) {
        throw new NotFoundException(
          `کارگاهی با شناسه "${id}" در سیستم یافت نشد.`,
        );
      }

      return workshop;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'خطایی در دریافت اطلاعات کارگاه رخ داد.',
      );
    }
  }

  async update(id: number, updateWorkshopDto: UpdateWorkshopDto, user) {
    console.log(updateWorkshopDto, id, user);
    try {
      const workshop = await this.workshopRepository.findOne({
        where: { id },
        relations: {
          owner: true,
        },
      });
      console.log(workshop);

      if (!workshop) {
        throw new NotFoundException(
          `کارگاهی با شناسه "${id}" برای به‌روزرسانی یافت نشد.`,
        );
      }

      if (workshop.owner?.id !== user.sub) {
        throw new ForbiddenException('شما اجازه انجام این کار را ندارید');
      }

      if (updateWorkshopDto.name && updateWorkshopDto.name !== workshop.name) {
        const existingWorkshop = await this.workshopRepository.findOne({
          where: { name: updateWorkshopDto.name },
        });

        if (existingWorkshop) {
          throw new ConflictException(
            `کارگاهی با نام "${updateWorkshopDto.name}" از قبل وجود دارد. لطفاً نام دیگری انتخاب کنید.`,
          );
        }
      }

      const updatedWorkshop = this.workshopRepository.merge(
        workshop,
        updateWorkshopDto,
      );

      const savedWorkshop = await this.workshopRepository.save(updatedWorkshop);

      return {
        message: 'کارگاه با موفقیت به‌روزرسانی شد.',
        workshop: savedWorkshop,
      };
    } catch (error) {
      console.error('❌ Workshop Update Error:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'خطایی در به‌روزرسانی کارگاه رخ داد.',
      );
    }
  }

  async remove(id: number) {
    try {
      const workshop = await this.workshopRepository.findOne({
        where: { id },
        relations: {
          users: true,
        },
      });

      if (!workshop) {
        throw new NotFoundException(
          `کارگاهی با شناسه "${id}" برای حذف یافت نشد.`,
        );
      }

      if (workshop.users && workshop.users.length > 0) {
        throw new ConflictException(
          `این کارگاه دارای ${workshop.users.length} کاربر عضو است. قبل از حذف کارگاه، ابتدا تمام کاربران را از آن خارج کنید.`,
        );
      }

      await this.workshopRepository.remove(workshop);

      return {
        message: `کارگاه "${workshop.name}" با موفقیت حذف شد.`,
        deletedWorkshopId: id,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('خطایی در حذف کارگاه رخ داد.');
    }
  }

  async activeWorkshop(Workshopdata, user) {
    console.log(Workshopdata);
    const workshop = await this.workshopRepository.findOne({
      where: {
        id: Workshopdata.wsID,
      },
    });

    if (!workshop) {
      throw new NotFoundException('کارگاه مورد نظر وجود ندارد.');
    }

    if (user.systemRole !== 'admin') {
      throw new ForbiddenException('شما اجازه انجام این عملیات را ندارید.');
    }

    const stat =
      Workshopdata.status === 'active'
        ? WorkshopStatus.ACTIVE
        : WorkshopStatus.INACTIVE;

    await this.workshopRepository.update(
      { id: Workshopdata.wsID },
      { status: stat },
    );

    return {
      message: 'وضعیت کارگاه با موفقیت فعال شد.',
    };
  }

  async Ownercreate(createUserDto: CreateOwnerDto, user: any) {
    try {
      const workshop = await this.workshopRepository.findOne({
        where: { id: createUserDto.workshop_id },
        relations: ['owner'],
      });

      if (!workshop) {
        throw new NotFoundException('کارگاه مورد نظر وجود ندارد.');
      }

      if (workshop.owner?.id !== user.sub) {
        throw new ForbiddenException('شما اجازه انجام این کار را ندارید.');
      }

      const result = await this.userService.createByOwner(createUserDto);

      return result;
    } catch (err) {
      console.error('Error in Ownercreate:', err);

      if (
        err instanceof NotFoundException ||
        err instanceof ForbiddenException ||
        err instanceof ConflictException
      ) {
        throw err;
      }

      throw new InternalServerErrorException('خطایی در ایجاد کاربر رخ داد.');
    }
  }
}
