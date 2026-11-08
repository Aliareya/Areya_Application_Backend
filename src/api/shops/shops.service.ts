import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Shop, ShopStatus } from './entities/shop.entity';

import {
  Store,
  StoreStatus,
  StoreCreationStatus,
} from '../stores/entities/store.entity';

import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,

    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // Validate BIGINT IDs.
  private validateId(id: string): void {
    if (!/^[1-9]\d*$/.test(id)) {
      throw new BadRequestException('شناسه واردشده معتبر نیست.');
    }
  }

  // Normalize shop name.
  private normalizeName(name: string): string {
    return name.trim().replace(/\s+/g, ' ');
  }

  // Generate slug.
  private generateSlug(name: string, id?: string): string {
    const englishName = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (englishName) {
      return id ? `${englishName}-${id}` : englishName;
    }

    return id ? `shop-${id}` : `shop-${Date.now()}`;
  }

  // Check store ownership.
  private async getOwnedStore(
    ownerId: string,
    storeId: string,
  ): Promise<Store> {
    this.validateId(storeId);

    const store = await this.storeRepository.findOne({
      where: { id: storeId, ownerId },
    });

    if (!store) {
      throw new NotFoundException('فروشگاه پیدا نشد یا شما مالک آن نیستید.');
    }

    return store;
  }

  // Check store status.
  private checkStoreStatus(store: Store): void {
    if (
      store.status !== StoreStatus.ACTIVE ||
      store.creationStatus !== StoreCreationStatus.APPROVED
    ) {
      throw new ForbiddenException('فروشگاه شما فعال یا تأییدشده نیست.');
    }
  }

  // Handle database unique errors.
  private handleDatabaseError(error: unknown): never {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    ) {
      throw new ConflictException(
        'دکانی با این نام یا شناسه قبلاً در فروشگاه شما ثبت شده است.',
      );
    }

    throw error;
  }

  // Create shop.
  async create(
    ownerId: string,
    storeId: string,
    createShopDto: CreateShopDto,
    file?: Express.Multer.File,
  ): Promise<Shop> {
    const store = await this.getOwnedStore(ownerId, storeId);
    this.checkStoreStatus(store);

    const normalizedName = this.normalizeName(createShopDto.name);

    if (normalizedName.length < 2) {
      throw new BadRequestException('نام دکان معتبر نیست.');
    }

    let uploadedImage: { url: string; publicId: string } | null = null;

    try {
      if (file) {
        uploadedImage = await this.cloudinaryService.uploadFile(file);
      }

      const shop = this.shopRepository.create({
        name: normalizedName,
        normalizedName,
        slug: this.generateSlug(normalizedName),
        phone: createShopDto.phone?.trim() || null,
        address: createShopDto.address?.trim() || null,
        logo: uploadedImage?.url || null,
        logoPublicId: uploadedImage?.publicId || null,
        storeId: store.id,
        status: ShopStatus.ACTIVE,
      });

      return await this.shopRepository.save(shop);
    } catch (error: unknown) {
      if (uploadedImage) {
        await this.cloudinaryService.removeImage(uploadedImage.publicId);
      }

      this.handleDatabaseError(error);
    }
  }

  // Get all shops.
  async findAll(ownerId: string, storeId: string): Promise<Shop[]> {
    await this.getOwnedStore(ownerId, storeId);

    return this.shopRepository.find({
      where: { storeId },
      order: { createdAt: 'DESC' },
    });
  }

  // Get one shop.
  async findOne(ownerId: string, storeId: string, id: string): Promise<Shop> {
    await this.getOwnedStore(ownerId, storeId);
    this.validateId(id);

    const shop = await this.shopRepository.findOne({
      where: { id, storeId },
    });

    if (!shop) {
      throw new NotFoundException('دکان مورد نظر پیدا نشد.');
    }

    return shop;
  }

  // Update shop.
  async update(
    ownerId: string,
    storeId: string,
    id: string,
    updateShopDto: UpdateShopDto,
    file?: Express.Multer.File,
  ): Promise<Shop> {
    const store = await this.getOwnedStore(ownerId, storeId);
    this.checkStoreStatus(store);

    const shop = await this.findOne(ownerId, storeId, id);

    if (Object.keys(updateShopDto).length === 0 && !file) {
      throw new BadRequestException(
        'حداقل یک فیلد یا تصویر برای ویرایش وارد کنید.',
      );
    }

    if (updateShopDto.name !== undefined) {
      const normalizedName = this.normalizeName(updateShopDto.name);

      if (normalizedName.length < 2) {
        throw new BadRequestException('نام دکان معتبر نیست.');
      }

      shop.name = normalizedName;
      shop.normalizedName = normalizedName;
      shop.slug = this.generateSlug(normalizedName, shop.id);
    }

    if (updateShopDto.phone !== undefined) {
      shop.phone = updateShopDto.phone?.trim() || null;
    }

    if (updateShopDto.address !== undefined) {
      shop.address = updateShopDto.address?.trim() || null;
    }

    let uploadedImage: { url: string; publicId: string } | null = null;

    try {
      if (file) {
        uploadedImage = await this.cloudinaryService.uploadFile(file);
      }

      const oldPublicId = shop.logoPublicId;

      if (uploadedImage) {
        shop.logo = uploadedImage.url;
        shop.logoPublicId = uploadedImage.publicId;
      }

      const updatedShop = await this.shopRepository.save(shop);

      if (uploadedImage && oldPublicId) {
        try {
          await this.cloudinaryService.removeImage(oldPublicId);
        } catch {
          // Database update succeeded; old image cleanup can be retried.
        }
      }

      return updatedShop;
    } catch (error: unknown) {
      if (uploadedImage) {
        await this.cloudinaryService.removeImage(uploadedImage.publicId);
      }

      this.handleDatabaseError(error);
    }
  }

  // Activate shop.
  async activate(ownerId: string, storeId: string, id: string): Promise<Shop> {
    const store = await this.getOwnedStore(ownerId, storeId);
    this.checkStoreStatus(store);

    const shop = await this.findOne(ownerId, storeId, id);

    shop.status = ShopStatus.ACTIVE;

    return this.shopRepository.save(shop);
  }

  // Deactivate shop.
  async deactivate(
    ownerId: string,
    storeId: string,
    id: string,
  ): Promise<Shop> {
    const shop = await this.findOne(ownerId, storeId, id);

    shop.status = ShopStatus.INACTIVE;

    return this.shopRepository.save(shop);
  }
}
