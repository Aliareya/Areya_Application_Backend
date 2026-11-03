import { Module } from '@nestjs/common';
import { WorkshopsService } from './workshops.service';
import { WorkshopsController } from './workshops.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workshop } from './entities/workshop.entity';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workshop, User]),
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'F',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [WorkshopsController],
  providers: [WorkshopsService],
  exports : [WorkshopsService]
})
export class WorkshopsModule {}
