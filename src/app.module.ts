import { Module } from '@nestjs/common';
import { UserModule } from './modules/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerModule } from './modules/customer.module';
import { PugAdapter } from '@nest-modules/mailer';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailQueueConsumer } from './consumers/emailQueueConsumer';
import { EmailQueueProducer } from './producers/emailQueueProducer';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
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
    UserModule,
    CustomerModule,
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/project'),
    MailerModule.forRoot({
      transport: 'smtps://proiectlicenta2021@gmail.com:andrei123456d@smtp.gmail.com',
      defaults: {
        from: '"nest-modules" <proiectlicenta2021@nestjs.com>',
      },
      template: {
        dir: './src/common/email-templates',
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    },
    )
  ],
  providers: [
    EmailQueueConsumer, 
    EmailQueueProducer, 
  ],
})

export class AppModule {
  
}