// suppliers.service.ts
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, QueryFailedError, Repository } from 'typeorm';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { Supplier, SupplierStatus } from './entities/supplier.entity';
import { User } from '../users/entities/user.entity';
import { Workshop } from '../workshops/entities/workshop.entity';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepo: Repository<Supplier>,

    @InjectRepository(Workshop)
    private readonly workshopRepo: Repository<Workshop>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateSupplierDto, user: { sub: number }) {
    const loginUser = await this.userRepo.findOne({
      where: { id: user.sub },
      relations: { workshop: true },
      select: { id: true, workshop: { id: true } },
    });

    if (!loginUser?.workshop) {
      throw new NotFoundException('کارگاه وجود ندارد');
    }

    const workshopId = loginUser.workshop.id;

    const exists = await this.supplierRepo.exists({
      where: { phone: dto.phone, workshopId },
    });

    if (exists) {
      throw new ConflictException('این تامین کننده وجود دارد');
    }

    try {
      const supplier = this.supplierRepo.create({
        name: dto.name,
        supplierShopName: dto.supplierShopName,
        kind: dto.kind,
        phone: dto.phone,
        address: dto.address,
        workshopId,
        status: SupplierStatus.ACTIVE,
      });

      return await this.supplierRepo.save(supplier);
    } catch (err) {
      if (this.isUniqueViolation(err)) {
        throw new ConflictException('این تامین کننده وجود دارد');
      }
      throw err;
    }
  }

  private isUniqueViolation(err: unknown): boolean {
    if (!(err instanceof QueryFailedError)) return false;
    const code = (err as any).driverError?.code;
    return code === '23505' || code === 'ER_DUP_ENTRY'; // Postgres / MySQL
  }

  async findAllByWorkshop(workshopId: number, user: any) {
    const usercheck = await this.userRepo.findOne({
      where: {
        id: user.sub,
        workshop: {
          id: workshopId,
        },
      },
    });

    if (!usercheck) {
      throw new ForbiddenException('شما دسترسی به این کارگاه را ندارید');
    }

    const suppliers = await this.supplierRepo.find({
      where: {
        workshopId: workshopId,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return suppliers;
  }

  async findOneByWorkshop(supplierId: number, workshopId: number, user: any) {
    const usercheck = await this.userRepo.findOne({
      where: {
        id: user.sub,
        workshop: {
          id: workshopId,
        },
      },
    });

    if (!usercheck) {
      throw new ForbiddenException('شما دسترسی به این کارگاه را ندارید');
    }

    const suppliers = await this.supplierRepo.findOne({
      where: {
        workshopId: workshopId,
        id: supplierId,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if(!suppliers){
      throw new NotFoundException("not cfound")
    }

    return suppliers;
  }

  async update(
    dto: UpdateSupplierDto,
    supplierId: number,
    workshopId: number,
    user: any,
  ) {

    const usercheck = await this.userRepo.findOne({
      where: {
        id: user.sub,
        workshop: {
          id: workshopId,
        },
      },
    });

    if (!usercheck) {
      throw new ForbiddenException('شما دسترسی به این کارگاه را ندارید');
    }

    const supplier = await this.supplierRepo.findOne({
      where: {
        id: supplierId,
        workshopId: workshopId,
      },
    });

    if (!supplier) {
      throw new NotFoundException('تامین‌کننده مورد نظر یافت نشد');
    }

    if (dto.phone) {
      const existingSupplier = await this.supplierRepo.findOne({
        where: {
          phone: dto.phone,
          workshopId: workshopId,
          id: Not(supplierId), 
        },
      });

      if (existingSupplier) {
        throw new ConflictException(
          'این شماره تماس قبلاً برای تامین‌کننده دیگری در این کارگاه ثبت شده است',
        );
      }
    }

    try {
      await this.supplierRepo.update(supplierId, {
        name: dto.name,
        supplierShopName: dto.supplierShopName,
        kind: dto.kind,
        phone: dto.phone,
        address: dto.address,
        status: dto.status,
      });

      return await this.supplierRepo.findOne({
        where: { id: supplierId },
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException('خطا در به‌روزرسانی اطلاعات');
    }
  }
}
