import {
  Body,
  Controller,
  Get,
  Patch,
  Request,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getOwnUser(@Request() req) {
    return this.usersService.findOwnUser(req.user.id);
  }

  @Patch('me')
  update(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateProfile(updateUserDto, req.user.id);
  }

  @Get('me/wishes')
  getOwnWishes(@Request() req) {
    return this.usersService.findOwnWishes(req.user.id);
  }

  @Post('find')
  find(@Body('query') query: string) {
    return this.usersService.findMany(query);
  }

  @Get(':username')
  getUserByName(@Param('username') username: string) {
    return this.usersService.findUserByName(username);
  }

  @Get(':username/wishes')
  getWishesByUsername(@Param('username') username: string) {
    return this.usersService.findWishesByUsername(username);
  }
}
