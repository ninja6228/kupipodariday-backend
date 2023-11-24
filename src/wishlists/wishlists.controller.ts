import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@Controller('wishlistlists')
@UseGuards(JwtGuard)
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Get()
  findAllWishlist() {
    return this.wishlistsService.findAllWishlist();
  }

  @Post()
  createWishlist(@Body() createWishlistDto: CreateWishlistDto, @Request() req) {
    return this.wishlistsService.createWishlist(createWishlistDto, req.user.id);
  }

  @Get(':id')
  findWishlistById(@Param('id') id: number) {
    return this.wishlistsService.findWishlistById(id);
  }

  @Patch(':id')
  updateWishlist(
    @Param('id') id: number,
    @Body() updateWishlistDto: UpdateWishlistDto,
    @Request() req,
  ) {
    return this.wishlistsService.updateWishlist(
      updateWishlistDto,
      id,
      req.user.id,
    );
  }

  @Delete(':id')
  deleteWishlist(@Param('id') id: number, @Request() req) {
    return this.wishlistsService.deleteWishlist(id, req.user.id);
  }
}
