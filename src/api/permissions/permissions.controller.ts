
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';

import { PermissionsService } from './permissions.service';

@Controller('permissions')
export class PermissionsController {
  constructor(
    private readonly permissionsService: PermissionsService,
  ) {}

  // Get all system permissions
  @Get()
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
