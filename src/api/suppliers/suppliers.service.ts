import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomInt } from 'crypto';

import { Supplier } from './entities/supplier.entity';
import { Shop } from '../shops/entities/shop.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { AccessControlService } from 'src/common/access-control/access-control.service';
import { generateSupplierCode } from '../../common/helpers/helpersFuntions';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,

    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,

    private readonly accessControlService: AccessControlService,
  ) {}

  // Create supplier
  async create(
    userID: string,
    shopID: string,
    dto: CreateSupplierDto,
  ): Promise<Supplier> {
    // 1. Validate user access to shop
    await this.accessControlService.validateUserShopAccess(userID, shopID);

    // 3. Generate supplier code
    let code: string;

    do {
      code = generateSupplierCode();
    } while (
      await this.supplierRepository.exists({
        where: {
          shopId: shopID,
          code,
        },
      })
    );

    // 4. Create supplier
    const supplier = this.supplierRepository.create({
      ...dto,
      shopId: shopID,
      code,
    });

    // 5. Save supplier
    return await this.supplierRepository.save(supplier);
  }

  async findAll(userID: string, shopID: string) {
    await this.accessControlService.validateUserShopAccess(userID, shopID);

    return await this.supplierRepository.find({
      where: {
        shopId: shopID,
      },
      order: {
        id: 'DESC',
      },
    });
  }
}
