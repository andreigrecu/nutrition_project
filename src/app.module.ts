import { Module } from '@nestjs/common';
import { UserModule } from './modules/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerModule } from './modules/customer.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    UserModule,
    CustomerModule,
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/project'),
  ],
})

export class AppModule {

}