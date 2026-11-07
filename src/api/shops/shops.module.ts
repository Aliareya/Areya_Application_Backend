import { Module } from '@nestjs/common';
import { ShopsService } from './shops.service';
import { ShopsController } from './shops.controller';
import { Shop } from './entities/shop.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Shop])],
  controllers: [ShopsController],
  providers: [ShopsService],
})
export class ShopsModule {}
