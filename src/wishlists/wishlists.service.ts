import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entity/users.entity';
import { Wish } from 'src/wishes/entity/wishes.entity';
import { Wishlist } from './entity/wishlists.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
  ) {}

  async findAllWishlist() {
    return await this.wishlistRepository.find({
      relations: {
        owner: true,
      },
    });
  }

  async createWishlist(createWishlistDto: CreateWishlistDto, userId: number) {
    const { itemsId } = createWishlistDto;
    const items = itemsId.map((item): Wish | { id: number } => ({ id: item }));
    const user = await this.userRepository.findOneBy({ id: userId });
    const wishes = await this.wishRepository.find({ where: items });
    const wishlist = this.wishlistRepository.create({
      ...createWishlistDto,
      owner: user,
      items: wishes,
    });
    return await this.wishlistRepository.save(wishlist);
  }

  async findWishlistById(id: number) {
    return await this.wishlistRepository.findOne({
      relations: {
        items: true,
        owner: true,
      },
      where: {
        id,
      },
    });
  }

  async updateWishlist(
    updateWishlistDto: UpdateWishlistDto,
    id: number,
    userId: number,
  ) {
    const wishlist = await this.wishlistRepository.findOne({
      relations: { owner: true },
      where: { id, owner: { id: userId } },
    });

    Object.keys(updateWishlistDto).map(async (key) => {
      if (key === 'itemsId') {
        const items = updateWishlistDto[key].map((item) => ({ id: item }));
        const wishes = await this.wishRepository.find({ where: items });
        wishlist.items = wishes;
      } else {
        wishlist[key] = updateWishlistDto[key];
      }
    });
    return this.wishlistRepository.save(wishlist);
  }

  async deleteWishlist(id: number, userId: number) {
    const wishlist = await this.wishlistRepository.findOne({
      relations: { owner: true },
      where: { id },
    });
    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException(
        'Вы не можете удалять чужие списки подарков',
      );
    }
    return await this.wishlistRepository.remove(wishlist);
  }
}
