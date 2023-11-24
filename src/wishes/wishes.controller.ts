import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Post()
  @UseGuards(JwtGuard)
  createWish(@Body() createWishDto: CreateWishDto, @Request() req) {
    return this.wishesService.createWish(createWishDto, req.user.id);
  }

  @Get('top')
  findTopWishes() {
    return this.wishesService.findTopWishes();
  }

  @Get('last')
  findLastWishes() {
    return this.wishesService.findLastWishes();
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  findWishById(@Param('id') id: number) {
    return this.wishesService.findWishById(id);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  updateWish(
    @Param('id') id: number,
    @Body() updateWishDto: UpdateWishDto,
    @Request() req,
  ) {
    return this.wishesService.updateWish(id, updateWishDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  deleteWish(@Param('id') id: number, @Request() req) {
    return this.wishesService.deleteWish(id, req.user.id);
  }

  @Post(':id/copy')
  @UseGuards(JwtGuard)
  copyWish(@Param('id') id: number, @Request() req) {
    return this.wishesService.copyWish(id, req.user);
  }
}
