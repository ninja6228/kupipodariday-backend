import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Offer } from './entity/offers.entity';
import { User } from '../users/entity/users.entity';
import { Wish } from '../wishes/entity/wishes.entity';
import { Repository } from 'typeorm';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer) private offerRepository: Repository<Offer>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Wish) private wishRepository: Repository<Wish>,
  ) {}

  async create(createOfferDto: CreateOfferDto, userId: number) {
    const { itemId, amount } = createOfferDto;
    const offer = Object.assign(new Offer(), createOfferDto);
    const wish = await this.wishRepository.findOneBy({ id: itemId });
    const user = await this.userRepository.findOne({
      relations: {
        wishes: true,
      },
      where: {
        id: userId,
      },
    });

    const willing = user.wishes.some((item) => item.id === wish.id);

    if (!willing) {
      offer.user = user;
      offer.item = wish;
      wish.raised = +wish.raised + amount;
      if (wish.raised > wish.price) {
        throw new BadRequestException(
          'Сумма превышает необходимую добавьте меньше',
        );
      }
      await this.wishRepository.save(wish);
      return await this.offerRepository.save(offer);
    }
    throw new BadRequestException('Вы не можете скидаться на свои подарки');
  }

  async getAllOffers() {
    return await this.offerRepository.find({
      relations: {
        user: true,
        item: true,
      },
    });
  }

  async findOne(id: number) {
    return await this.offerRepository.findOne({
      relations: {
        user: true,
        item: true,
      },
      where: {
        id: id,
      },
    });
  }
}
