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
import { UserInfoService } from '../services/userInfo.service';
import { Program } from '../models/program.model';

@ApiTags('Foods')
@Controller('foods')
export class FoodsController {

    constructor(
        @InjectModel('Food')
        private readonly foodModel: Model<Food>,
        @InjectModel('Program')
        private readonly programModel: Model<Program>,
        private readonly foodService: FoodService,
        private readonly userService: UserService,
        private readonly responseFactory: ResponseFactory,
        private readonly userInfoService: UserInfoService
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
            createFoodDto.snacks,
            null,
            0,
            0,
            0,
            0
        )

        if(!food)
            return this.responseFactory.error({ _general: 'userFood_not_created'}, response);

        return this.responseFactory.ok(food, response);
    }

    //la o 00:00:01 o sa fie cronjob-ul
    @Cron('10 15 09 * * *')
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
                null,
                0,
                0,
                0,
                0
            )
            .catch(error => console.log(error))
        }
        
        return 'Done creating users daily plans';
    }

    //la 23:59:59 o sa fie
    @Cron('55 15 09 * * *')
    async dailyGoals(
        @Res() response: Response
    ): Promise<any> {

        const users = await this.userService.getAllUnfiltered();
        if(!users)
            return this.responseFactory.notFound({ _general: "food.users_not_found" }, response);
        
        let BMR:number = 0;
        for(let i = 0; i < users.length; i++) {
            const userInfo = await this.userInfoService.findOne(users[i].id);
            if(!userInfo)
                return this.responseFactory.notFound({ _general: "food.userInfo_not_found" }, response);

            let sameBMR =  10 * userInfo['weight'] + 
                6.25 * userInfo['height'] - 5 * userInfo['age'];

            if(userInfo['gender'] === 'male') {
                BMR = sameBMR + 5;
            } else if(userInfo['gender'] === 'female') {
                BMR = sameBMR - 161;
            }


            let carbosGramsGoal = 0;
            let fatsGramsGoal = 0;
            let proteinsGramsGoal = 0;
            if(userInfo['programId'] && userInfo['programId'] != " ") {
                const program = await this.programModel.findOne({
                    _id: userInfo['programId']
                });

                if(!program)
                    return this.responseFactory.notFound({ _general: 'programs.program_not_found' }, response);

                let percentage = program['percentageType'] - 100;
                BMR = parseInt((BMR + ((percentage * BMR) / 100 )).toFixed());
            
                if(userInfo['carbohydratesPercent'] >= 0)
                    carbosGramsGoal = parseInt(((userInfo['carbohydratesPercent'] * BMR) / 400).toFixed());
                if(userInfo['fatsPercent'] >= 0)
                    fatsGramsGoal = parseInt(((userInfo['fatsPercent'] * BMR) / 900).toFixed());
                if(userInfo['proteinsPercent'] >= 0)
                    proteinsGramsGoal = parseInt(((userInfo['proteinsPercent'] * BMR) / 400).toFixed());
            } else {
                BMR = 0;
            }

            const today = new Date();
            today.setUTCHours(0,0,0,0);

            const todayUserMeals = await this.foodModel.findOne({ 
                userId: users[i]['id'],
                createdAt: { $gt: today } 
            });

            todayUserMeals['caloriesGoal'] = BMR;
            todayUserMeals['carbosGoal'] = carbosGramsGoal;
            todayUserMeals['fatsGoal'] = fatsGramsGoal;
            todayUserMeals['proteinsGoal'] = proteinsGramsGoal;

            const update = await todayUserMeals.save(); 
            if(!update)
                return this.responseFactory.error({ _general: 'foods.user_daily_meals_not_found' }, response);
        }

        return 'Done updating';

    }

}
