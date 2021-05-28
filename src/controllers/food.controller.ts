import { Controller, Post, Body, Res, Put} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Food } from '../models/food.model';
import { FoodService } from '../services/food.service';
import { CreateFoodDto } from '../dtos/createFood.dto';
import { ApiTags } from '@nestjs/swagger';
import { ResponseFactory } from '../factories/ResponseFactory';
import { Response } from 'express';
import { Cron } from '@nestjs/schedule';
import { UserService } from '../services/user.service';

@ApiTags('Foods')
@Controller('foods')
export class FoodsController {

    constructor(
        @InjectModel('Food')
        private readonly foodModel: Model<Food>,
        private readonly foodService: FoodService,
        private readonly userService: UserService,
        private readonly responseFactory: ResponseFactory,
    ) { }

    @Post()
    async create(
        @Body() createFoodDto: CreateFoodDto,
        @Res() response: Response
    ): Promise<Food> {

        if(createFoodDto.userId === "")
            return this.responseFactory.error('Please insert userId', response);

        const food: Food = await this.foodService.create(
            new Date(),
            new Date(),
            createFoodDto.userId,
            createFoodDto.breakfast,
            createFoodDto.lunch,
            createFoodDto.dinner,
            createFoodDto.snacks
        )

        if(!food)
            return this.responseFactory.error({ _general: 'userFood_not_created'}, response);

        return this.responseFactory.ok(food, response);
    }

    @Cron('05 34 10 * * *')
    async dailyCreate(
    ): Promise<any> {
        let userDailyPlan;
        const users = await this.userService.getAllUnfiltered();

        for(let i = 0; i < users.length; i++) {
            userDailyPlan = await this.foodService.create(
                new Date(),
                new Date(),
                users[i].id,
                [],
                [],
                [],
                [],
            )
            .catch(error => console.log(error))
        }
        
        return 'Done creating users daily plans';
    }

}