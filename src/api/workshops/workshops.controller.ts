import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WorkshopsService } from './workshops.service';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { PermissionGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CreateOwnerDto } from '../users/dto/create-owner-dto';

@Controller('workshops')

@UseGuards(AuthGuard)
export class WorkshopsController {
  constructor(private readonly workshopsService: WorkshopsService) {}

  @Post()
  create(@Body() createWorkshopDto: CreateWorkshopDto, @GetUser() user) {
    return this.workshopsService.create(createWorkshopDto, user);
  }

  
  @Post('user-insert')
  Ownercreate(@Body() createUserDto: CreateOwnerDto , @GetUser() user ) {
    return this.workshopsService.Ownercreate(createUserDto , user);
  }

  @Post('active-workshop')
  @UseGuards(PermissionGuard)
  @RequirePermissions('workshop.active')
  activeWorkshop(@Body() workshop, @GetUser() user) {
    return this.workshopsService.activeWorkshop(workshop, user);
  }

  @Get()
  @UseGuards(PermissionGuard)
  @RequirePermissions('workshop.read')
  findAll() {
    return this.workshopsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workshopsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWorkshopDto: UpdateWorkshopDto,
    @GetUser() user
  ) {
    return this.workshopsService.update(+id, updateWorkshopDto ,  user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workshopsService.remove(+id);
  }

}
