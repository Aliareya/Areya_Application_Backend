import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../../api/users/entities/user.entity';
import { Store } from '../../api/stores/entities/store.entity';
import { Shop } from '../../api/shops/entities/shop.entity';

import { AccessControlService } from './access-control.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Store, Shop])],

  providers: [AccessControlService],

  exports: [AccessControlService],
})
export class AccessControlModule {}
