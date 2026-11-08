
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ShopsService } from './shops.service';
import { ShopsController } from './shops.controller';

import { Shop } from './entities/shop.entity';
import { Store } from '../stores/entities/store.entity';

import { CloudinaryModule } from '../../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Shop,
      Store,
    ]),
    CloudinaryModule,
  ],
  controllers: [ShopsController],
  providers: [ShopsService],
  exports: [ShopsService],
})
export class ShopsModule {}
