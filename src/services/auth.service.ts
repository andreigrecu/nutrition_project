import * as jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtPayload } from '../interfaces/jwtPayloadInterface';


@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
  ) { }

  async createToken(email: string, id: string) {

    const token = jwt.sign({ email, id }, "JWT_SECRET", { expiresIn: 5000 });
    return {
      expires_in: 5000,
      access_token: token,
    };
  }

  async validateUser(payload: JwtPayload): Promise<any> {

    return await this.userService.getByEmail(payload.email);
  }

}
