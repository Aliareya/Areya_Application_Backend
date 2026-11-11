import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import { DataSource } from 'typeorm';

import {
  Store,
  StoreStatus,
  StoreCreationStatus,
} from './entities/store.entity';

import { User, SystemRole } from '../users/entities/user.entity';

import { CreateStoreDto } from './dto/create-store.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

interface AuthenticatedRequest {
  user?: {
    id: string;
    systemRole: SystemRole;
  };
}

@Injectable()
export class StoresService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // Validate ID
  private validateId(id: string): void {
    if (!id || !/^[1-9]\d*$/.test(id)) {
      throw new BadRequestException('شناسه واردشده معتبر نیست.');
    }
  }

  // Create store
  async create(
    ownerId: string,
    createStoreDto: CreateStoreDto,
    file?: Express.Multer.File,
  ) {
    this.validateId(ownerId);

    let uploadedLogo: { url: string; publicId: string } | null = null;

    try {
      // Upload logo
      if (file) {
        uploadedLogo = await this.cloudinaryService.uploadFile(file);
      }

      return await this.dataSource.transaction(async (manager) => {
        const userRepository = manager.getRepository(User);
        const storeRepository = manager.getRepository(Store);

        const user = await userRepository.findOne({
          where: { id: ownerId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!user) {
          throw new NotFoundException('کاربر پیدا نشد.');
        }

        if (!user.isActive) {
          throw new ForbiddenException('حساب کاربری شما غیرفعال است.');
        }

        if (user.systemRole !== SystemRole.USER) {
          throw new ForbiddenException(
            'فقط کاربران عادی می‌توانند درخواست ایجاد فروشگاه ثبت کنند.',
          );
        }

        if (user.shopId) {
          throw new ForbiddenException(
            'کاربرانی که به یک دکان متصل هستند نمی‌توانند فروشگاه ایجاد کنند.',
          );
        }

        const existingStore = await storeRepository.findOne({
          where: { ownerId: user.id },
        });

        if (existingStore) {
          throw new ConflictException('شما قبلاً یک فروشگاه ایجاد کرده‌اید.');
        }

        const normalizedSlug = createStoreDto.slug.trim().toLowerCase();

        const existingSlug = await storeRepository.findOne({
          where: { slug: normalizedSlug },
        });

        if (existingSlug) {
          throw new ConflictException(
            'این شناسه قبلاً برای فروشگاه دیگری استفاده شده است.',
          );
        }

        const store = storeRepository.create({
          ownerId: user.id,
          name: createStoreDto.name.trim(),
          slug: normalizedSlug,
          phone: createStoreDto.phone?.trim() || null,
          address: createStoreDto.address?.trim() || null,

          logo: uploadedLogo?.url ?? null,
          logoPublicId: uploadedLogo?.publicId ?? null,

          status: StoreStatus.INACTIVE,
          creationStatus: StoreCreationStatus.PENDING,
        });

        const savedStore = await storeRepository.save(store);

        // Change user role to OWNER
        user.systemRole = SystemRole.OWNER;
        await userRepository.save(user);

        return {
          success: true,
          message:
            'درخواست ایجاد فروشگاه با موفقیت ثبت شد. پس از بررسی مدیر سیستم، نتیجه به شما اعلام می‌شود.',
          store: savedStore,
        };
      });
    } catch (error) {
      // Remove uploaded logo if database transaction fails
      if (uploadedLogo) {
        try {
          await this.cloudinaryService.removeImage(uploadedLogo.publicId);
        } catch {
          // Ignore Cloudinary cleanup errors
        }
      }

      // Handle database unique constraint violations
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === '23505'
      ) {
        throw new ConflictException('این شناسه یا فروشگاه قبلاً ثبت شده است.');
      }

      throw error;
    }
  }

  // Get all stores (Super Admin)
  async findAll() {
    const storeRepository = this.dataSource.getRepository(Store);

    const [stores, totalStore, activeStore, inactiveStore, pendingStore] =
      await Promise.all([
        storeRepository.find({
          relations: {
            owner: true,
          },
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            creationStatus: true,
            address: true,
            phone: true,
            logo: true,
            createdAt: true,
            owner: {
              id: true,
              fullName: true,
            },
          },
          order: {
            createdAt: 'DESC',
          },
        }),

        storeRepository.count(),

        storeRepository.count({
          where: { status: StoreStatus.ACTIVE },
        }),

        storeRepository.count({
          where: { status: StoreStatus.INACTIVE },
        }),

        storeRepository.count({
          where: {
            creationStatus: StoreCreationStatus.PENDING,
          },
        }),
      ]);

    return {
      statistics: {
        total_store: totalStore,
        active_store: activeStore,
        inactive_store: inactiveStore,
        pending_store: pendingStore,
      },
      stores,
    };
  }

  // Get one store
  async findOne(id: string, req: AuthenticatedRequest): Promise<Store> {
    this.validateId(id);

    if (!req?.user?.id || !req.user.systemRole) {
      throw new ForbiddenException('دسترسی معتبر نیست.');
    }

    const storeRepository = this.dataSource.getRepository(Store);

    const store = await storeRepository.findOne({
      where: { id },
      relations: {
        owner: true,
        shops: {
          users:true
        },
      },
      select: {
        id: true,
        ownerId: true,
        name: true,
        slug: true,
        phone: true,
        address: true,
        logo: true,
        status: true,
        creationStatus: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          id: true,
          fullName: true,
          phone:true,
          email:true
        },
      },
    });

    if (!store) {
      throw new NotFoundException('فروشگاه مورد نظر پیدا نشد.');
    }

    // Super Admin can access all stores
    if (req.user.systemRole === SystemRole.SUPER_ADMIN) {
      return store;
    }

    // Only the store owner can access their store
    if (
      req.user.systemRole !== SystemRole.OWNER ||
      store.ownerId !== req.user.id
    ) {
      throw new ForbiddenException(
        'شما اجازه دسترسی به این فروشگاه را ندارید.',
      );
    }

    return store;
  }

  // Activate store
  async activate(
    id: string,
    actorRole: SystemRole,
    status: StoreStatus,
  ): Promise<Store> {
    this.validateId(id);

    // Only Super Admin can activate stores
    if (actorRole !== SystemRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        'فقط مدیر سیستم اجازه فعال‌سازی فروشگاه را دارد.',
      );
    }

    const storeRepository = this.dataSource.getRepository(Store);

    const store = await storeRepository.findOne({
      where: { id },
    });

    if (!store) {
      throw new NotFoundException('فروشگاه مورد نظر پیدا نشد.');
    }

    store.creationStatus = StoreCreationStatus.APPROVED;
    store.status = status;

    return storeRepository.save(store);
  }
}
