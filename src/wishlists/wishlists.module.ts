import { Module } from '@nestjs/common';
import { WishlistsController } from './wishlists.controller';
import { WishlistsService } from './wishlists.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wish } from '../wishes/entity/wishes.entity';
import { Wishlist } from './entity/wishlists.entity';
import { User } from '../users/entity/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wish, Wishlist, User])],
  controllers: [WishlistsController],
  providers: [WishlistsService],
})
export class WishlistsModule {}
