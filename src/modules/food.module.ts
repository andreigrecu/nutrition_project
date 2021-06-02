import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MongooseModule } from '@nestjs/mongoose';
import { FoodSchema } from "../models/food.model";
import { FoodsController } from "../controllers/food.controller";
import { FoodService } from "../services/food.service";
import { ResponseFactory } from "../factories/ResponseFactory";
import { UserService } from "../services/user.service";
import { User } from "../entities/user";
import { UserInfo } from "../entities/userInfo";
import { PasswordService } from "../services/password.service";
import { UserInfoService } from "../services/userInfo.service";
import { ProgramSchema } from "../models/program.model";

@Module({
    imports:[
        TypeOrmModule.forFeature([
          User,
          UserInfo
        ]),    
        MongooseModule.forFeature(
            [
              { name: 'Food', schema: FoodSchema },
              { name: 'Program', schema: ProgramSchema },
            ]
        ),    
    ],
    exports: [TypeOrmModule],
    providers: [
        FoodService,
        ResponseFactory,
        UserService,
        PasswordService,
        UserInfoService
    ],
    controllers: [
      FoodsController
    ]
})
export class FoodModule {}