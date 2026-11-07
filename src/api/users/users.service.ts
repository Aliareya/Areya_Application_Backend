import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SystemRole, User } from './entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    if (createUserDto.phone) {
      const phoneChecked = await this.userRepository.findOne({
        where: { phone: createUserDto.phone },
      });
      if (phoneChecked) {
        throw new ConflictException(
          'User with this phone number already exists',
        );
      }
    }

    if (createUserDto.email) {
      const normalizedEmail = createUserDto.email?.trim().toLowerCase() ?? null;
      const emailChecked = await this.userRepository.findOne({
        where: { email: normalizedEmail },
      });
      if (emailChecked) {
        throw new ConflictException('User with this email already exists');
      }
    }
    
    const normalizedEmail = createUserDto.email?.trim().toLowerCase() ?? null;
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      fullName: createUserDto.fullName,
      phone: createUserDto.phone,
      email: normalizedEmail?? null,
      password: hashedPassword,
      systemRole: SystemRole.USER,
      shopId: null,
      isActive: true,
    });

    try {
      const savedUser = await this.userRepository.save(user);

      const { password, ...result } = savedUser;

      return result;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const dbError = error.driverError as {
          code?: string;
          constraint?: string;
        };

        if (dbError.code === '23505') {
          if (dbError.constraint === 'UQ_users_phone') {
            throw new ConflictException({
              message: 'Phone number already exists',
              errors: [
                {
                  field: 'phone',
                  message: 'This phone number is already registered',
                },
              ],
            });
          }

          if (dbError.constraint === 'UQ_users_email') {
            throw new ConflictException({
              message: 'Email already exists',
              errors: [
                {
                  field: 'email',
                  message: 'This email is already registered',
                },
              ],
            });
          }
        }
      }

      throw error;
    }
  }

  async findByIdentifierWithPassword(identifier: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where(
        'user.phone = :identifier OR LOWER(user.email) = LOWER(:identifier)',
        { identifier },
      )
      .getOne();
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
