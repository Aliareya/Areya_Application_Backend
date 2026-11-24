import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import pg from 'pg';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UsersModule } from './api/users/users.module';
import { StoresModule } from './api/stores/stores.module';
import { ShopsModule } from './api/shops/shops.module';
import { RolesModule } from './api/roles/roles.module';
import { PermissionsModule } from './api/permissions/permissions.module';
import { AuthModule } from './api/auth/auth.module';
import { AccessControlModule } from './common/access-control/access-control.module';
import { SuppliersModule } from './api/suppliers/suppliers.module';
import { UnitsModule } from './api/units/units.module';
import { WarehousesModule } from './api/warehouses/warehouses.module';
import { PurchasesModule } from './api/purchases/purchases.module';
import { ProductsModule } from './api/products/products.module';
import { ColorsModule } from './api/colors/colors.module';
import { SizesModule } from './api/sizes/sizes.module';
import { InventoryModule } from './api/inventory/inventory.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    // config datrabase connection
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        return configService.getOrThrow<TypeOrmModuleOptions>('database');
      },
    }),
    CloudinaryModule,
    UsersModule,
    StoresModule,
    ShopsModule,
    RolesModule,
    PermissionsModule,
    AuthModule,
    AccessControlModule,
    SuppliersModule,
    UnitsModule,
    WarehousesModule,
    PurchasesModule,
    ProductsModule,
    ColorsModule,
    SizesModule,
    InventoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
