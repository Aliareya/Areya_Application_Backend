import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() dto: CreateRoleDto, @GetUser() user) {
    return this.rolesService.create(dto, user);
  }

  @Get('workshop/:workshopId')
  findAllByWorkshop(@Param('workshopId', ParseIntPipe) workshopId: number) {
    return this.rolesService.findAllByWorkshop(workshopId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }

  @Patch('users/:userId/assign-role')
  assignRoleToUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: AssignRoleDto,
  ) {
    return this.rolesService.assignRoleToUser(userId, dto.roleId);
  }

  @Delete('users/:userId/remove-role')
  removeRoleFromUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.rolesService.removeRoleFromUser(userId);
  }
}
