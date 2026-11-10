import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Get,
  Patch,
  BadRequestException,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { StoresService } from './stores.service';

import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';

import { SystemRole } from '../users/entities/user.entity';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';

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
  @Post()
  @Roles(SystemRole.USER)
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: memoryStorage(),
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (!allowedTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException('فرمت تصویر باید JPG، PNG یا WEBP باشد.'),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createStoreDto: CreateStoreDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.storesService.create(
      this.validateId(req.user.id),
      createStoreDto,
      file,
    );
  }

  // Get All Stores
  @Get()
  @Roles(SystemRole.SUPER_ADMIN)
  findAll() {
    return this.storesService.findAll();
  }

  @Roles(SystemRole.SUPER_ADMIN, SystemRole.OWNER)
  @Get(':id')
  findOne(@Param('id') id: string ,@Req() req) {
    return this.storesService.findOne(this.validateId(id) , req);
  }

  // Update Store
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
  //   return this.storesService.update(this.validateId(id), updateStoreDto);
  // }

  // // Activate Store
  // @Patch(':id/activate')
  // activate(@Param('id') id: string) {
  //   return this.storesService.activate(this.validateId(id));
  // }

  // // Deactivate Store
  // @Patch(':id/deactivate')
  // deactivate(@Param('id') id: string) {
  //   return this.storesService.deactivate(this.validateId(id));
  // }
}
