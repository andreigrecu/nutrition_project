import { Module } from '@nestjs/common';
import { UserModule } from './modules/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    UserModule
  ],
})

export class AppModule {

}