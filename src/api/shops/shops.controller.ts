
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  UseGuards,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Request } from 'express';

import { ShopsService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';

interface AuthenticatedRequest extends Request {
  user: User;
}

@Controller('stores/:storeId/shops')
@UseGuards(JwtAuthGuard)
export class ShopsController {
  constructor(
    private readonly shopsService: ShopsService,
  ) {}

  private validateId(id: string): string {
    if (!/^[1-9]\d*$/.test(id)) {
      throw new BadRequestException('شناسه واردشده معتبر نیست.');
    }

    return id;
  }

  // Create shop
  @Post()
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: memoryStorage(),
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  create(
    @Req() req: AuthenticatedRequest,
    @Param('storeId') storeId: string,
    @Body() createShopDto: CreateShopDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({
            maxSize: 2 * 1024 * 1024,
          }),
          new FileTypeValidator({
            fileType: /^image\/(jpeg|png|webp)$/,
          }),
        ],
      }),
    )
    file?: Express.Multer.File,
  ) {
    return this.shopsService.create(
      req.user.id,
      this.validateId(storeId),
      createShopDto,
      file,
    );
  }

  // Get all shops
  @Get()
  findAll(
    @Req() req: AuthenticatedRequest,
    @Param('storeId') storeId: string,
  ) {
    return this.shopsService.findAll(
      req.user.id,
      this.validateId(storeId),
    );
  }

  // Get one shop
  @Get(':id')
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('storeId') storeId: string,
    @Param('id') id: string,
  ) {
    return this.shopsService.findOne(
      req.user.id,
      this.validateId(storeId),
      this.validateId(id),
    );
  }

  // Update shop
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: memoryStorage(),
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  update(
    @Req() req: AuthenticatedRequest,
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() updateShopDto: UpdateShopDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({
            maxSize: 2 * 1024 * 1024,
          }),
          new FileTypeValidator({
            fileType: /^image\/(jpeg|png|webp)$/,
          }),
        ],
      }),
    )
    file?: Express.Multer.File,
  ) {
    return this.shopsService.update(
      req.user.id,
      this.validateId(storeId),
      this.validateId(id),
      updateShopDto,
      file,
    );
  }

  // Activate shop
  @Patch(':id/activate')
  activate(
    @Req() req: AuthenticatedRequest,
    @Param('storeId') storeId: string,
    @Param('id') id: string,
  ) {
    return this.shopsService.activate(
      req.user.id,
      this.validateId(storeId),
      this.validateId(id),
    );
  }

  // Deactivate shop
  @Patch(':id/deactivate')
  deactivate(
    @Req() req: AuthenticatedRequest,
    @Param('storeId') storeId: string,
    @Param('id') id: string,
  ) {
    return this.shopsService.deactivate(
      req.user.id,
      this.validateId(storeId),
      this.validateId(id),
    );
  }
}
