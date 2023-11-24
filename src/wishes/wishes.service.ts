import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from './entity/wishes.entity';
import { User } from 'src/users/entity/users.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { Repository } from 'typeorm';
import { UpdateWishDto } from './dto/update-wish.dto';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish) private wisheRepository: Repository<Wish>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async createWish(createWishDto: CreateWishDto, userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });
    return await this.wisheRepository.save({ ...createWishDto, owner: user });
  }

  async findLastWishes() {
    return await this.wisheRepository.find({
      order: {
        createdAt: 'DESC',
      },
      skip: 0,
      take: 40,
    });
  }

  async findTopWishes() {
    return await this.wisheRepository.find({
      order: {
        copied: 'DESC',
      },
      skip: 0,
      take: 10,
    });
  }

  async findWishById(id: number) {
    const wish = await this.wisheRepository.findOne({
      relations: {
        offers: {
          user: true,
        },
        owner: true,
      },
      where: {
        id,
      },
    });
    if (!wish) {
      throw new BadRequestException('Такого подарка нету');
    }
    return wish;
  }

  async updateWish(id: number, updateWishDto: UpdateWishDto, userId: number) {
    const wish = await this.wisheRepository.findOne({
      relations: { offers: true, owner: true },
      where: {
        id,
        owner: {
          id: userId,
        },
      },
    });
    if (!wish) {
      throw new BadRequestException('Такого подарка нету');
    }
    if (!wish.offers.length) {
      Object.assign(wish, updateWishDto);
      return this.wisheRepository.save(wish);
    }
    return wish;
  }

  async deleteWish(id: number, userId: number) {
    const wish = await this.wisheRepository.findOne({
      relations: { owner: true },
      where: {
        id,
        owner: {
          id: userId,
        },
      },
    });
    if (!wish) {
      throw new BadRequestException('Такого подарка нету');
    }
    try {
      return await this.wisheRepository.remove(wish);
    } catch (error) {
      throw new ConflictException(
        'Нельзя удалить подарок на который уже кто-то скинулся',
      );
    }
  }

  async copyWish(id: number, user: User) {
    const wish = await this.wisheRepository.findOneBy({ id });
    const availabilityWish = await this.wisheRepository.findOne({
      where: { owner: { id: user.id }, name: wish.name },
    });
    if (availabilityWish) {
      throw new ConflictException('Нельзя добовить подарок повторно');
    } else {
      wish.copied += 1;
      await this.wisheRepository.save(wish);
      const newWish = this.wisheRepository.create(wish);
      newWish.copied = 0;
      newWish.raised = 0;
      newWish.owner = user;
      await this.wisheRepository.insert(newWish);
    }
    return user;
  }
}
