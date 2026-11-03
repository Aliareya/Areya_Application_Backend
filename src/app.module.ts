import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './api/auth/auth.module';
import { UsersModule } from './api/users/users.module';

import pg from 'pg';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { WorkshopsModule } from './api/workshops/workshops.module';
import { SubscriptionPlanModule } from './api/subscription-plan/subscription-plan.module';
import { RolesModule } from './api/roles/roles.module';
import { PermissionsModule } from './api/permissions/permissions.module';
import { SuppliersModule } from './api/suppliers/suppliers.module';


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
    AuthModule,
    UsersModule,
    WorkshopsModule,
    SubscriptionPlanModule,
    CloudinaryModule,
    RolesModule,
    PermissionsModule,
    SuppliersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
