import {
  ConflictException,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import * as bycrypt from 'bcrypt';
import { User } from './entity/users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private async hashPassword(password: string) {
    return bycrypt.hash(password, 10);
  }

  private errorUniqueUser(error: any): boolean {
    return (
      error instanceof QueryFailedError && error.driverError.code === '23505'
    );
  }

  async findOwnUser(userId: number) {
    return await this.userRepository.findOneBy({ id: userId });
  }

  async createUser(createUserDto: CreateUserDto): Promise<any> {
    const { password } = createUserDto;
    const hashPassword = await this.hashPassword(password);
    try {
      const user = { ...createUserDto, password: hashPassword };
      await this.userRepository.save(user);
      const { password, ...saveUser } = user;
      return saveUser;
    } catch (error) {
      if (this.errorUniqueUser(error)) {
        throw new ConflictException(
          'Пользователь с такми данными уже существует',
        );
      }
      throw error;
    }
  }

  async updateProfile(updateUserDto: UpdateUserDto, userId: number) {
    const user = await this.findOwnUser(userId);
    for (const key in updateUserDto) {
      key === 'password'
        ? (user.password = await this.hashPassword(updateUserDto.password))
        : (user[key] = updateUserDto[key]);
    }
    try {
      await this.userRepository.save(user);
      const { password, ...saveUser } = user;
      return saveUser;
    } catch (error) {
      if (this.errorUniqueUser(error)) {
        throw new ConflictException(
          'Пользователь с такми данными уже существует',
        );
      }
      throw error;
    }
  }

  async findOwnWishes(userId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        wishes: true,
      },
    });
    return user.wishes;
  }

  async findMany(query: string) {
    if (!query) {
      throw new BadRequestException('Query should not be empty');
    }
    const formattedQuery = query.toLowerCase();
    return await this.userRepository
      .createQueryBuilder('user')
      .where('LOWER(user.username) LIKE :query', {
        query: `%${formattedQuery}%`,
      })
      .orWhere('LOWER(user.email) LIKE :query', {
        query: `%${formattedQuery}%`,
      })
      .getMany();
  }

  async findOne(id: number) {
    return await this.userRepository.findOneBy({ id });
  }

  async findUserByName(username: string) {
    const user = await this.userRepository.findOneBy({ username });
    if (!user) {
      throw new BadRequestException('Такого пользователя нет');
    }
    return user;
  }

  async findWishesByUsername(username: string) {
    const user = await this.userRepository.findOne({
      where: {
        username,
      },
      relations: {
        wishes: true,
      },
    });
    if (!user) {
      throw new BadRequestException('Такого пользователя нет');
    }
    return user.wishes;
  }
}
