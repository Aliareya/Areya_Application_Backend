// suppliers.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { PermissionGuard } from 'src/common/guards/permissions.guard';
import { RequirePermissions } from 'src/common/decorators/permissions.decorator';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Controller('suppliers')
@UseGuards(AuthGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @UseGuards(PermissionGuard)
  @RequirePermissions('supplier.create')
  async create(@Body() dto: CreateSupplierDto, @GetUser() user) {
    const data = await this.suppliersService.create(dto, user);
    return { message: 'تأمین‌کننده با موفقیت ثبت شد', data };
  }


  @Get('/workshop/:id')
  findAll(@Param('id', ParseIntPipe) workshopId: number , @GetUser() user) {
    return this.suppliersService.findAllByWorkshop(workshopId , user);
  }
  
  @Get(':sID/workshop/:wsID')
  findOne(
    @Param('wsID', ParseIntPipe) workshopId: number ,
    @Param('sID', ParseIntPipe) supplierId: number ,
    @GetUser() user
  ){
    return this.suppliersService.findOneByWorkshop( supplierId ,workshopId , user);
  }


  // @Get(':id')
  // findOne(
  //   @Param('workshopId', ParseIntPipe) workshopId: number,
  //   @Param('id', ParseIntPipe) id: number,
  // ) {
  //   return this.suppliersService.findOne(workshopId, id);
  // }

  @Patch(':sID/workshop/:wsID')
  async update(
    @Param('wsID', ParseIntPipe) workshopId: number,
    @Param('sID', ParseIntPipe) supplierId: number,
    @Body() dto: UpdateSupplierDto,
    @GetUser() user
  ) {
    const data = await this.suppliersService.update(dto ,supplierId ,workshopId, user);
    return { message: 'اطلاعات تأمین‌کننده ویرایش شد', data };
  }

  // @Delete(':id')
  // @HttpCode(HttpStatus.OK)
  // async remove(
  //   @Param('workshopId', ParseIntPipe) workshopId: number,
  //   @Param('id', ParseIntPipe) id: number,
  // ) {
  //   await this.suppliersService.remove(workshopId, id);
  //   return { message: 'تأمین‌کننده حذف شد' };
  // }
}
