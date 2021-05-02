import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponseFactory } from '../factories/ResponseFactory';
import { BullModule } from '@nestjs/bull';
import { EmailQueueProducer } from '../producers/emailQueueProducer';
import { ForgotPasswordService } from '../services/forgotPassword.service';
import { ForgotPasswordController } from '../controllers/forgotPassword.controller';
import { UserService } from '../services/user.service';
import { User } from '../entities/user';
import { PasswordService } from '../services/password.service';
import { UserInfo } from '../entities/userInfo';

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
      ResponseFactory,
      EmailQueueProducer,
      UserService,
      ForgotPasswordService,
      PasswordService
  ],

  controllers: [
    ForgotPasswordController
  ],
})

export class ForgotPasswordModule { }