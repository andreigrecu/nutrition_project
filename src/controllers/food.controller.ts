import { Controller, Post, Body, Res, Put, Get} from '@nestjs/common';
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
import { InjectRepository } from '@nestjs/typeorm';
import { UserInfo } from '../entities/userInfo';
import { Repository } from 'typeorm';
import { TrophyService } from '../services/trophy.service';
import { User } from '../entities/user';

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
        private readonly userInfoService: UserInfoService,
        @InjectRepository(UserInfo) 
        private userInfoRepository: Repository<UserInfo>,
        @InjectRepository(User) 
        private userRepository: Repository<User>,
        private readonly trophyService: TrophyService
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
            0,
            0
        )

        if(!food)
            return this.responseFactory.error({ _general: 'userFood_not_created'}, response);

        return this.responseFactory.ok(food, response);
    }

    async checkProgram(userMeals, userInfo) {

        if(userMeals[1]['programId'] === userMeals[2]['programId']) {

            const userInfoUpdate = await this.userInfoRepository.update(
                userInfo['id'], {
                    programRespected: userMeals[1]['programId'],
                    numOfDaysRespected: userInfo['numOfDaysRespected'] + 1
                }
            );

            if(!userInfoUpdate)
                console.log("userInfo not updated in cronJob");
        } else {
            const userInfoUpdate = await this.userInfoRepository.update(
                userInfo['id'], {
                    programRespected: userMeals[1]['programId'],
                    numOfDaysRespected: 1
                }
            );
            if(!userInfoUpdate)
                console.log("userInfo not updated in cronJob");
        }
    }

    async updateWithZeroDays(userMeals, userInfo) {
        
        const userInfoUpdate = await this.userInfoRepository.update(
            userInfo['id'], {
                programRespected: userMeals[1]['programId'],
                numOfDaysRespected: 0
            }
        );
        if(!userInfoUpdate)
            console.log("userInfo not updated in cronJob");
    }

    //la o 00:00:01 o sa fie cronjob-ul
    @Cron('42 09 14 * * *')
    async dailyCreate(
    ): Promise<any> {

        let userDailyPlan;
        const users = await this.userService.getAllUnfiltered();

        const today = new Date();
        today.setUTCHours(0,0,0,0);
        const twoDaysAgo = new Date(today);
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

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
                0,
                0
            )

            //trophy logic 
            const userMeals = await this.foodModel.find({
                userId: users[i]['id'],
                createdAt: { $gt: twoDaysAgo }
            })
                .sort({ createdAt: -1 })

            if(!userMeals)
                console.log("error at getting user meals in cronJob");

            let nutrients = await this.userService.getADayNutrients(userMeals[1]);
            let userInfo = await this.userInfoRepository.findOne({
                where: {
                    userId:  users[i]['id']
                }
            });
            if(!userInfo)
                console.log("userInfo not found in cronJob");

            if(userMeals[1]['programId']) {
                const program = await this.programModel.findOne({
                    _id: userMeals[1]['programId']
                });

                let caloriesMargins = parseInt(((5 * userMeals[1]['caloriesGoal']) / 100).toFixed());
                let carbosMargins = parseInt(((10 * userMeals[1]['carbosGoal']) / 100).toFixed());
                let fatsMargins = parseInt(((10 * userMeals[1]['fatsGoal']) / 100).toFixed());
                let proteinsMargins = parseInt(((10 * userMeals[1]['proteinsGoal']) / 100).toFixed());

                if(program['caloriesAdjustment'] === 0) {
                    if(
                        parseInt(nutrients['calories']['totalCalories'].toFixed()) <= userMeals[1]['caloriesGoal'] + caloriesMargins &&
                        parseInt(nutrients['calories']['totalCalories'].toFixed()) >= userMeals[1]['caloriesGoal'] - caloriesMargins &&
                        parseInt(nutrients['carbohydrates']['totalCarbohydrates'].toFixed()) <= userMeals[1]['carbosGoal'] + carbosMargins &&
                        parseInt(nutrients['carbohydrates']['totalCarbohydrates'].toFixed()) >= userMeals[1]['carbosGoal'] - carbosMargins &&
                        parseInt(nutrients['fats']['totalFats'].toFixed()) <= userMeals[1]['fatsGoal'] + fatsMargins &&
                        parseInt(nutrients['fats']['totalFats'].toFixed()) >= userMeals[1]['fatsGoal'] - fatsMargins &&
                        parseInt(nutrients['proteins']['totalProteins'].toFixed()) <= userMeals[1]['proteinsGoal'] + proteinsMargins &&
                        parseInt(nutrients['proteins']['totalProteins'].toFixed()) >= userMeals[1]['proteinsGoal'] - proteinsMargins
                    ) {
                        this.checkProgram(userMeals, userInfo);
                    } else {
                        this.updateWithZeroDays(userMeals, userInfo);
                    }

                } else if(program['caloriesAdjustment'] > 0) {
                    if(
                        parseInt(nutrients['calories']['totalCalories'].toFixed()) <= userMeals[1]['caloriesGoal'] + caloriesMargins &&
                        parseInt(nutrients['calories']['totalCalories'].toFixed()) >= userMeals[1]['caloriesGoal'] &&
                        parseInt(nutrients['carbohydrates']['totalCarbohydrates'].toFixed()) <= userMeals[1]['carbosGoal'] + carbosMargins &&
                        parseInt(nutrients['carbohydrates']['totalCarbohydrates'].toFixed()) >= userMeals[1]['carbosGoal'] &&
                        parseInt(nutrients['fats']['totalFats'].toFixed()) <= userMeals[1]['fatsGoal'] + fatsMargins &&
                        parseInt(nutrients['fats']['totalFats'].toFixed()) >= userMeals[1]['fatsGoal'] &&
                        parseInt(nutrients['proteins']['totalProteins'].toFixed()) <= userMeals[1]['proteinsGoal'] + proteinsMargins &&
                        parseInt(nutrients['proteins']['totalProteins'].toFixed()) >= userMeals[1]['proteinsGoal']
                    ) {
                        this.checkProgram(userMeals, userInfo);
                    } else {
                        this.updateWithZeroDays(userMeals, userInfo);
                    }
                } else if(program['caloriesAdjustment'] < 0) {
                    if(
                        parseInt(nutrients['calories']['totalCalories'].toFixed()) <= userMeals[1]['caloriesGoal'] &&
                        parseInt(nutrients['calories']['totalCalories'].toFixed()) >= userMeals[1]['caloriesGoal'] - caloriesMargins &&
                        parseInt(nutrients['carbohydrates']['totalCarbohydrates'].toFixed()) <= userMeals[1]['carbosGoal'] &&
                        parseInt(nutrients['carbohydrates']['totalCarbohydrates'].toFixed()) >= userMeals[1]['carbosGoal'] - carbosMargins &&
                        parseInt(nutrients['fats']['totalFats'].toFixed()) <= userMeals[1]['fatsGoal'] &&
                        parseInt(nutrients['fats']['totalFats'].toFixed()) >= userMeals[1]['fatsGoal'] - fatsMargins &&
                        parseInt(nutrients['proteins']['totalProteins'].toFixed()) <= userMeals[1]['proteinsGoal'] &&
                        parseInt(nutrients['proteins']['totalProteins'].toFixed()) >= userMeals[1]['proteinsGoal'] - proteinsMargins
                    ) {
                        this.checkProgram(userMeals, userInfo);
                    } else {
                        this.updateWithZeroDays(userMeals, userInfo);
                    }
                }
            } else {
                await this.userInfoRepository.update(
                    userInfo['id'], {
                        numOfDaysRespected: 0
                    }
                );
            }

            const trophies = await this.trophyService.findAll();
            userInfo = await this.userInfoRepository.findOne({
                where: {
                    userId:  users[i]['id']
                }
            });
            if(!userInfo)
                console.log("userInfo not found in cronJob");

            const userTrophies = await this.userService.findUserTrophies(users[i].id);
            for(let k = 0; k < trophies.length; k++) {
                if(trophies[k]['programId'] === userInfo['programRespected'] && trophies[k]['daysForAchieving'] === userInfo['numOfDaysRespected']) {

                    let alreadyHasIt = false;
                    for(let kk = 0; kk < userTrophies['trophies'].length; kk ++)
                        if(userTrophies['trophies'][kk]['daysForAchieving'] === trophies[k]['daysForAchieving'] && userTrophies['trophies'][kk]['programId'] === trophies[k]['programId'])
                            alreadyHasIt = true;

                    if(alreadyHasIt === false) {
                        let user = await this.userRepository.findOne(users[i].id, {
                            relations: [
                                'trophies'
                            ]
                        });
                        user.trophies.push(trophies[k]);
                        user.newTrophy = true;
                        user = await this.userRepository.save(user);
                    }
                }
            }

        }  
        return 'Done creating users daily plans';
    }

    //la 23:59:59 o sa fie
    @Cron('25 05 15 * * *')
    async dailyGoals(
        @Res() response: Response
    ): Promise<any> {

        const users = await this.userService.getAllUnfiltered();
        if(!users)
            return this.responseFactory.notFound({ _general: "food.users_not_found" }, response);
        
        let BMR: number = 0;
        for(let i = 0; i < users.length; i++) {
            const userInfo = await this.userInfoService.findOne(users[i].id);

            if(userInfo) {
                let sameBMR =  10 * userInfo['weight'] + 
                    6.25 * userInfo['height'] - 5 * userInfo['age'];

                let activityTypeAdjustment;
                if(userInfo['activityType'] && userInfo['activityType'] === 'sedentary')
                    activityTypeAdjustment = 1.2;
                if(userInfo['activityType'] && userInfo['activityType'] === 'lightlyActive')
                    activityTypeAdjustment = 1.375;
                if(userInfo['activityType'] && userInfo['activityType'] === 'veryActive')
                    activityTypeAdjustment = 1.725;

                if(userInfo['gender'] === 'male') {
                    BMR = sameBMR + 5;
                    BMR = BMR * activityTypeAdjustment;
                } else if(userInfo['gender'] === 'female') {
                    BMR = sameBMR - 161;
                    BMR = BMR * activityTypeAdjustment;
                }

                let carbosGramsGoal = 0;
                let fatsGramsGoal = 0;
                let proteinsGramsGoal = 0;
                if(userInfo && userInfo['programId'] && userInfo['programId'] != " ") {
                    const program = await this.programModel.findOne({
                        _id: userInfo['programId']
                    });

                    if(!program)
                        return this.responseFactory.notFound({ _general: 'programs.program_not_found' }, response);

                    BMR = BMR + program['caloriesAdjustment'];
                
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

                if(todayUserMeals) {
                    todayUserMeals['caloriesGoal'] = BMR;
                    todayUserMeals['carbosGoal'] = carbosGramsGoal;
                    todayUserMeals['fatsGoal'] = fatsGramsGoal;
                    todayUserMeals['proteinsGoal'] = proteinsGramsGoal;

                    if(BMR) {
                        todayUserMeals['programId'] = userInfo['programId'];
                    }
                }

                const update = await todayUserMeals.save(); 
                if(!update)
                    return this.responseFactory.error({ _general: 'foods.user_daily_meals_not_found' }, response);
            }
        }

        return 'Done updating';

    }

}
