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
import { UpdateStoreDto } from './dto/update-store.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@Injectable()
export class StoresService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // Validate bigint ID
  private validateId(id: string): void {
    if (!/^[1-9]\d*$/.test(id)) {
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

    // Upload logo to Cloudinary
    let uploadedLogo: { url: string; publicId: string } | null = null;

    if (file) {
      uploadedLogo = await this.cloudinaryService.uploadFile(file);
    }

    try {
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

        if(user?.shopId){
          throw new ForbiddenException(
            'کاربرانی که به یک فروشگاه متصل هستند نمی‌توانند فروشگاه ایجاد کنند.',
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
      // Remove uploaded image if store creation fails
      if (uploadedLogo) {
        try {
          await this.cloudinaryService.removeImage(uploadedLogo.publicId);
        } catch {
          // Preserve the original database or validation error
        }
      }

      throw error;
    }
  }

  // Get all stores
  async findAll(): Promise<Store[]> {
    return this.dataSource.getRepository(Store).find({
      relations: {
        owner: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // Get one store
  async findOne(id: string): Promise<Store> {
    this.validateId(id);

    const storeRepository = this.dataSource.getRepository(Store);

    const store = await storeRepository.findOne({
      where: { id },
      relations: {
        owner: true,
        shops: true,
      },
    });

    if (!store) {
      throw new NotFoundException('فروشگاه مورد نظر پیدا نشد.');
    }

    return store;
  }

  // Update store
  async update(id: string, updateStoreDto: UpdateStoreDto): Promise<Store> {
    const store = await this.findOne(id);

    if (Object.keys(updateStoreDto).length === 0) {
      throw new BadRequestException('حداقل یک فیلد برای ویرایش وارد کنید.');
    }

    if (updateStoreDto.slug !== undefined) {
      const normalizedSlug = updateStoreDto.slug.trim().toLowerCase();

      const existingSlug = await this.dataSource.getRepository(Store).findOne({
        where: { slug: normalizedSlug },
      });

      if (existingSlug && existingSlug.id !== id) {
        throw new ConflictException(
          'این شناسه قبلاً برای فروشگاه دیگری استفاده شده است.',
        );
      }

      store.slug = normalizedSlug;
    }

    if (updateStoreDto.name !== undefined) {
      store.name = updateStoreDto.name.trim();
    }

    if (updateStoreDto.phone !== undefined) {
      store.phone = updateStoreDto.phone?.trim() || null;
    }

    if (updateStoreDto.address !== undefined) {
      store.address = updateStoreDto.address?.trim() || null;
    }

    return this.dataSource.getRepository(Store).save(store);
  }

  // Activate store
  async activate(id: string): Promise<Store> {
    const store = await this.findOne(id);

    if (store.creationStatus !== StoreCreationStatus.APPROVED) {
      throw new BadRequestException('فروشگاه هنوز تأیید نشده است.');
    }

    store.status = StoreStatus.ACTIVE;

    return this.dataSource.getRepository(Store).save(store);
  }

  // Deactivate store
  async deactivate(id: string): Promise<Store> {
    const store = await this.findOne(id);

    store.status = StoreStatus.INACTIVE;

    return this.dataSource.getRepository(Store).save(store);
  }
}
