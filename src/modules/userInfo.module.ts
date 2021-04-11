import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserInfoService } from '../services/userInfo.service';
import { UserInfoController } from '../controllers/userInfo.controller';
import { UserInfo } from '../entities/userInfo';
import { ResponseFactory } from '../factories/ResponseFactory';
import { UserService } from '../services/user.service';
import { PasswordService } from '../services/password.service';
import { User } from '../entities/user';


@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserInfo,
            User
        ])
      ],
    providers: [
        UserInfoService,
        UserService,
        PasswordService,
        ResponseFactory
    ],
  
    controllers: [
        UserInfoController
    ],
  })
  
  export class UserInfoModule { }