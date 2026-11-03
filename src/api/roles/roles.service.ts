import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Role } from './entities/role.entity';
import { User } from '../users/entities/user.entity';
import { Workshop } from '../workshops/entities/workshop.entity';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Workshop)
    private readonly workshopRepository: Repository<Workshop>,
  ) {}

  // ساخت نقش جدید برای یک کارگاه
  async create(createRoleDto: CreateRoleDto, user) {
    const { workshopId, name, slug, description } = createRoleDto;

    const workshop = await this.workshopRepository.findOne({
      where: { id: workshopId },
      relations: {
        owner: true,
      },
      select: {
        id: true,
        status: true,
        owner: {
          id: true,
        },
      },
    });

    if (!workshop) {
      throw new NotFoundException('Workshop not found');
    }

    if (workshop?.status === 'inactive') {
      throw new NotFoundException('Workshop is Not Active');
    }

    if (workshop.owner?.id !== user.sub) {
      throw new ForbiddenException('شما اجازه انجام این عملیات را ندارید.');
    }
    console.log(workshop);

    const existingRole = await this.roleRepository.findOne({
      where: {
        slug,
        workshop: { id: workshopId },
      },
    });

    if (existingRole) {
      throw new ConflictException(
        'This role slug already exists in this workshop',
      );
    }

    const role = this.roleRepository.create({
      name,
      slug,
      description: description ?? null,
      workshop,
    });

    await this.roleRepository.save(role);
    return {
      message: 'Role craeted Successfully...',
    };
  }

  // دریافت نقش‌های یک کارگاه
  async findAllByWorkshop(workshopId: number): Promise<Role[]> {
    const workshop = await this.workshopRepository.findOne({
      where: { id: workshopId },
    });

    if (!workshop) {
      throw new NotFoundException('Workshop not found');
    }

    return this.roleRepository.find({
      where: {
        workshop: { id: workshopId },
      },
      order: { id: 'ASC' },
    });
  }

  // دریافت یک نقش
  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: {
        workshop: true,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async findbyIDandWorkshopID(id: number, workshop_id: number) {
    const role = await this.roleRepository.findOne({
      where: {
        id: id, 
        workshop:{
          id:workshop_id
        } 
      },
    });


    return role
  }

  // ویرایش نقش
  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    if (updateRoleDto.slug !== undefined) {
      const duplicate = await this.roleRepository.findOne({
        where: {
          slug: updateRoleDto.slug,
          workshop: { id: role.workshop.id },
        },
      });

      if (duplicate && duplicate.id !== id) {
        throw new ConflictException(
          'This role slug already exists in this workshop',
        );
      }

      role.slug = updateRoleDto.slug;
    }

    if (updateRoleDto.name !== undefined) {
      role.name = updateRoleDto.name;
    }

    if (updateRoleDto.description !== undefined) {
      role.description = updateRoleDto.description;
    }

    return this.roleRepository.save(role);
  }

  // حذف نقش
  async remove(id: number): Promise<{ message: string }> {
    const role = await this.findOne(id);

    const assignedUsers = await this.userRepository.count({
      where: {
        roleEntity: { id },
      },
    });

    if (assignedUsers > 0) {
      throw new ConflictException(
        'This role is assigned to employees. Reassign them before deleting it.',
      );
    }

    await this.roleRepository.remove(role);

    return { message: 'Role deleted successfully' };
  }

  // اختصاص یک نقش به کارمند
  async assignRoleToUser(
    userId: number,
    roleId: number,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: {
        workshop: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.workshop) {
      throw new BadRequestException('This user does not belong to a workshop');
    }

    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: {
        workshop: true,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (user.workshop.id !== role.workshop.id) {
      throw new BadRequestException(
        'You cannot assign a role from another workshop',
      );
    }

    user.roleEntity = role;

    await this.userRepository.save(user);

    return { message: 'Role assigned successfully' };
  }

  // حذف نقش از کارمند
  async removeRoleFromUser(userId: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.roleEntity = null;

    await this.userRepository.save(user);

    return { message: 'Role removed successfully' };
  }
}
