import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Get,
  Patch,
  BadRequestException,
} from '@nestjs/common';

import { StoresService } from './stores.service';

import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';

import { SystemRole } from '../users/entities/user.entity';

@Controller('stores')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StoresController {
  constructor(private readonly storesService: StoresService) {}
  
  // Validate BIGINT ID
  private validateId(id: string): string {
    if (!/^[1-9]\d*$/.test(id)) {
      throw new BadRequestException('شناسه واردشده معتبر نیست.');
    }
    
    return id;
  }
  
  // Create Store
  @Post(':ownerId')
  @Roles(SystemRole.SUPER_ADMIN)
  create(
    @Param('ownerId') ownerId: string,
    @Body() createStoreDto: CreateStoreDto,
  ) {
    return this.storesService.create(this.validateId(ownerId), createStoreDto);
  }

  // Get All Stores
  @Get()
  findAll() {
    return this.storesService.findAll();
  }

  // Get Single Store
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(this.validateId(id));
  }

  // Update Store
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.storesService.update(this.validateId(id), updateStoreDto);
  }

  // Activate Store
  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.storesService.activate(this.validateId(id));
  }

  // Deactivate Store
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.storesService.deactivate(this.validateId(id));
  }
}
