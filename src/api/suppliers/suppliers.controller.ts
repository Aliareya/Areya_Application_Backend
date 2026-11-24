import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Permissions } from '../../common/decorator/permissions.decorator';
import { SystemRole } from '../users/entities/user.entity';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import { Roles } from '../../common/decorator/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('shop/:shopID/suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Permissions('shop.create')
  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Param('shopID') shopID: string,
    @Body() createSupplierDto: CreateSupplierDto,
  ) {
    const userID = req?.user.id;
    return this.suppliersService.create(userID, shopID, createSupplierDto);
  }

  @Roles(SystemRole.OWNER, SystemRole.EMPLOYEE)
  @Permissions('shop.read')
  @Get()
  findAll(@Req() req: AuthenticatedRequest, @Param('shopID') shopID: string) {
    const userID = req?.user.id;
    return this.suppliersService.findAll(userID, shopID);
  }

  @Roles(SystemRole.OWNER, SystemRole.EMPLOYEE)
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Param('shopID') shopID: string,
  ) {
    const userID = req?.user.id;
    return this.suppliersService.findOne(userID ,shopID, id);
  }
  
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Param('shopID') shopID: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    const userID = req?.user.id;
    return this.suppliersService.update(userID , shopID , id, updateSupplierDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.suppliersService.remove(+id);
  // }
}
