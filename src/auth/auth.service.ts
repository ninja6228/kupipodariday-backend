import { Injectable } from '@nestjs/common';
import * as bycrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entity/users.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtServise: JwtService,
  ) {}

  async auth(user: User) {
    const payload = { sub: user.id };
    return { access_token: this.jwtServise.sign(payload, { expiresIn: '7d' }) };
  }

  async validatePassword(username: string, password: string) {
    const user = await this.usersService.findUserByName(username);
    const matched = await bycrypt.compare(password, user.password);
    if (matched) {
      const { password, ...saveUser } = user;
      return saveUser;
    }
    return null;
  }
}
