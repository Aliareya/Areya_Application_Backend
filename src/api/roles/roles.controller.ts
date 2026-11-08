
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Request } from 'express';

import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';


import { User, SystemRole } from '../users/entities/user.entity';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';

interface AuthenticatedRequest extends Request {
  user: User;
}

@Controller('shops/:shopId/roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(SystemRole.OWNER)
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
  ) {}

  // Create role
  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Param('shopId') shopId: string,
    @Body() createRoleDto: CreateRoleDto,
  ) {
    return this.rolesService.create(
      req.user.id,
      shopId,
      createRoleDto,
    );
  }

  // Get all roles
  @Get()
  findAll(
    @Req() req: AuthenticatedRequest,
    @Param('shopId') shopId: string,
  ) {
    return this.rolesService.findAll(
      req.user.id,
      shopId,
    );
  }

  // Get one role
  @Get(':id')
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('shopId') shopId: string,
    @Param('id') id: string,
  ) {
    return this.rolesService.findOne(
      req.user.id,
      shopId,
      id,
    );
  }

  // Update role
  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('shopId') shopId: string,
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(
      req.user.id,
      shopId,
      id,
      updateRoleDto,
    );
  }

  // Delete role
  @Delete(':id')
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('shopId') shopId: string,
    @Param('id') id: string,
  ) {
    return this.rolesService.remove(
      req.user.id,
      shopId,
      id,
    );
  }
}
