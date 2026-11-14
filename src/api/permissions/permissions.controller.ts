
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';

import { PermissionsService } from './permissions.service';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { SystemRole } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermissionsController {
  constructor(
    private readonly permissionsService: PermissionsService,
  ) {}

  // Get all system permissions
  @Get()
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.OWNER)
  findAll() {
    return this.permissionsService.findAll();
  }

  // Get permission by ID
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    const permission = await this.permissionsService.findOne(
      id.toString(),
    );

    if (!permission) {
      throw new NotFoundException('دسترسی مورد نظر پیدا نشد.');
    }

    return permission;
  }
}
