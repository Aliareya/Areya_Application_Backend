
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';

@Controller('permissions')
export class PermissionsController {
  constructor(
    private readonly permissionsService: PermissionsService,
  ) {}

  @Post()
  create(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.create(dto);
  }

  @Get()
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get('role/:roleId')
  findByRole(
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.permissionsService.findByRole(roleId);
  }

  @Post('role/:roleId')
  assignToRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body() dto: AssignPermissionsDto,
  ) {
    return this.permissionsService.assignToRole(
      roleId,
      dto.permissionIds,
    );
  }

  @Delete('role/:roleId/permission/:permissionId')
  removeFromRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ) {
    return this.permissionsService.removeFromRole(
      roleId,
      permissionId,
    );
  }
}
