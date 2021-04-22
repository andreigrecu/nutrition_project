import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from '../services/user.service';
import { UserController } from '../controllers/user.controller';
import { User } from '../entities/user';
import { ResponseFactory } from '../factories/ResponseFactory';
import { PasswordService } from '../services/password.service';
import { BullModule } from '@nestjs/bull';
import { EmailQueueProducer } from '../producers/emailQueueProducer';
import { QueryParamsFilterFactory } from '../factories/queryParamsFilterFactory';
import { UserInfo } from '../entities/userInfo';
import { UserInfoService } from '../services/userInfo.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email',
      redis: {
        host: '127.0.0.1',
        port: 6379,
        password: 'Project2021!'
      },
      limiter: {
        max: 10,
        duration: 1000
      }
    }),
      TypeOrmModule.forFeature([
          User,
          UserInfo
      ])
    ],
  providers: [
      UserService,
      UserInfoService,
      PasswordService,
      ResponseFactory,
      EmailQueueProducer,
      QueryParamsFilterFactory
  ],

  controllers: [
      UserController
  ],
})

export class UserModule { }