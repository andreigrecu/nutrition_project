import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { JwtStrategy } from '../strategies/jwtStrategy';
import { PassportModule } from '@nestjs/passport';
import { UserInfo } from '../entities/userInfo';
import { PasswordService } from '../services/password.service';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([
        User,
        UserInfo
      ]),    
  ],
  providers: [
    AuthService,
    UserService,
    JwtStrategy,
    PasswordService
  ],
})
export class AuthModule {}
