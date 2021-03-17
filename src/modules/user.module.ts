import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from '../services/user.service';
import { UserController } from '../controllers/user.controller';
import { User } from '../entities/user';
import { ResponseFactory } from '../factories/ResponseFactory';

@Module({
  imports: [
      TypeOrmModule.forFeature([
          User
      ])
    ],
  providers: [
      UserService,
      ResponseFactory
  ],

  controllers: [
      UserController
  ],
})

export class UserModule { }