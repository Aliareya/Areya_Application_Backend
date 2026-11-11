import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Request } from 'express';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { SystemRole } from './entities/user.entity';
import { AssignUserRoleDto } from './dto/assign-user-role.dto';
import { CreateShopUserDto } from './dto/create-shop-employee.dto';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    systemRole: SystemRole;
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('shops/:shopId/employees')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.OWNER)
  createShopEmployee(
    @Req() req: AuthenticatedRequest,
    @Param('shopId') shopId: string,
    @Body() dto: CreateShopUserDto,
  ) {
    console.log('[CREATE SHOP EMPLOYEE] Controller reached');
    console.log('Actor ID:', req.user?.id);
    console.log('Shop ID:', shopId);
    console.log('System Role:', dto.systemRole);
    console.log('Role ID:', dto.roleId);

    return this.usersService.createShopEmployee(req.user.id, shopId, dto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Put('shops/:shopId/users/:userId/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.OWNER)
  assignRole(
    @Req() req: AuthenticatedRequest,
    @Param('shopId') shopId: string,
    @Param('userId') userId: string,
    @Body() assignUserRoleDto: AssignUserRoleDto,
  ) {
    return this.usersService.assignRole(
      req.user.id,
      shopId,
      userId,
      assignUserRoleDto,
    );
  }

  @Get('shops/:shopId/users/:userId/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.OWNER)
  getEmployeeRole(
    @Req() req: AuthenticatedRequest,
    @Param('shopId') shopId: string,
    @Param('userId') userId: string,
  ) {
    return this.usersService.getEmployeeRole(req.user.id, shopId, userId);
  }
}
