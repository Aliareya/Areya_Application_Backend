import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SystemRole, User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Workshop } from '../workshops/entities/workshop.entity';
import { CreateOwnerDto } from './dto/create-owner-dto';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly roleServices: RolesService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const existingUser = await this.userRepository.findOne({
        where: [
          { email: createUserDto.email },
          { phoneNumber: createUserDto.phoneNumber },
        ],
      });

      if (existingUser) {
        if (existingUser.email === createUserDto.email) {
          throw new ConflictException('Email is Already Exist...');
        }
        if (existingUser.phoneNumber === createUserDto.phoneNumber) {
          throw new ConflictException('Phone is Already Exist...');
        }
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

      const newUser = this.userRepository.create({
        ...createUserDto,
        systemRole: SystemRole.USER,
        password: hashedPassword,
      });

      await this.userRepository.save(newUser);

      return {
        message: 'User created Successfully...',
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the user.',
      );
    }
  }

  async findAll() {
    try {
      const users = await this.userRepository.find({
        select: {
          id: true,
          fullName: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
        order: {
          id: 'DESC',
        },
      });

      return {
        message: 'Users retrieved successfully',
        count: users.length,
        users,
      };
    } catch (error) {
      console.error('Find all users error:', error);

      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  async findOne(id: number) {
    try {
      if (!Number.isInteger(id) || id <= 0) {
        throw new NotFoundException('User not found');
      }

      const user = await this.userRepository.findOne({
        where: { id },
        relations: {
          workshop: true,
        },
      });

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Find one user error:', error);
      throw new InternalServerErrorException('Failed to retrieve user');
    }
  }

  async getWithPassword(email: string) {
    try {
      const user = await this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .leftJoinAndSelect('user.workshop', 'workshop')
        .where('user.email = :email', { email })
        .getOne();

      return user;
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve user');
    }
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async getUserWhitRole(id: number, workshp_id) {
    try {
      if (!Number.isInteger(id) || id <= 0) {
        throw new NotFoundException('User not found');
      }

      const user = await this.userRepository.findOne({
        where: { id },
        relations: {
          workshop: true,
          roleEntity: true,
        },
      });

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Find one user error:', error);
      throw new InternalServerErrorException('Failed to retrieve user');
    }
  }

  async getUserRoleByWorkshop(userId: number, workshopId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
        workshop: {
          id: workshopId,
        },
      },
      relations: {
        workshop: true,
        roleEntity: {
          workshop: true,
          rolePermissions: {
            permission: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found in this workshop');
    }

    if (!user.roleEntity) {
      return null;
    }

    if (user.roleEntity.workshop?.id !== workshopId) {
      throw new ForbiddenException(
        'This role does not belong to this workshop',
      );
    }

    return user.roleEntity;
  }

  async createByOwner(createOwnerDto: CreateOwnerDto) {
    try {
      const existingUser = await this.userRepository.findOne({
        where: [
          { email: createOwnerDto.email },
          { phoneNumber: createOwnerDto.phoneNumber },
        ],
      });

      if (existingUser) {
        if (existingUser.email === createOwnerDto.email) {
          throw new ConflictException('این ایمیل قبلاً ثبت شده است.');
        }
        if (existingUser.phoneNumber === createOwnerDto.phoneNumber) {
          throw new ConflictException('این شماره موبایل قبلاً ثبت شده است.');
        }
      }

      const hashedPassword = await bcrypt.hash(createOwnerDto.password, 12);

      const { workshop_id, role_id, ...userData } = createOwnerDto;

      const checkrole = await this.roleServices.findbyIDandWorkshopID(
        role_id,
        workshop_id,
      );

      if (!checkrole) {
        throw new NotFoundException(
          'این نقش متعلق به این کارگاه نیست یا وجود ندارد.',
        );
      }

      const newUser = this.userRepository.create({
        ...userData,
        systemRole: SystemRole.CUSTOMER,
        password: hashedPassword,

        workshop: { id: workshop_id } as Workshop,
        roleEntity: { id: role_id } as any,
      });

      await this.userRepository.save(newUser);

      return {
        message: 'کاربر با موفقیت ایجاد و به کارگاه متصل شد.',
        user: newUser,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error('Create User Error:', error);
      throw new InternalServerErrorException(
        'خطایی غیرمنتظره هنگام ایجاد کاربر رخ داد.',
      );
    }
  }
}
