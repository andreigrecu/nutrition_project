import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from '../services/user.service';
import { UserController } from '../controllers/user.controller';
import { User } from '../entities/user';
import { ResponseFactory } from '../factories/ResponseFactory';
import { PasswordService } from '../services/password.service';

@Module({
  imports: [
      TypeOrmModule.forFeature([
          User
      ])
    ],
  providers: [
      UserService,
      PasswordService,
      ResponseFactory,
  ],

  controllers: [
      UserController
  ],
})

export class UserModule { }