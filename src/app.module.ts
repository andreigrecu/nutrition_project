import { Module } from '@nestjs/common';
import { UserModule } from './modules/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerModule } from './modules/customer.module';
import { PugAdapter } from '@nest-modules/mailer';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
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
})

export class AppModule {

}