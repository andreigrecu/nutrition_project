import { Controller, Post, Body, Get, Res, Query, Put, Param, Delete, UseGuards, UseFilters} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { ApiTags, ApiQuery, ApiBearerAuth } from "@nestjs/swagger";
import { CreateUserDto } from '../dtos/createUser.dto';
import { ResponseFactory } from '../factories/ResponseFactory';
import { Response } from 'express';
import { EmailQueueProducer } from '../producers/emailQueueProducer';
import { PaginationDto } from '../dtos/pagination.dto';
import { SortDto } from '../dtos/sort.dto';
import { UserQueryParams } from '../queryparams/userQueryParams';
import { QueryParamsFilterFactory } from '../factories/queryParamsFilterFactory';
import { AuthDto } from '../dtos/auth.dto';
import { PasswordService } from '../services/password.service';
import { UpdateUserDto } from '../dtos/updateUser.dto';
import { UserInfo } from '../entities/userInfo';
import { UpdateUserFoodDto } from '../dtos/updateUserFood.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Food } from '../models/food.model';
import { FoodService } from '../services/food.service';
import { ChangePasswordDto } from '../dtos/changePassword.dto';
import { DeleteFoodItemDto } from '../dtos/deleteFoodItem.dto';
import { MealType } from '../common/mealType';
import { AuthGuard } from '@nestjs/passport';
import { Program } from '../models/program.model';
import { UpdateWorkoutDto } from '../dtos/updateWorkoutDto';

@ApiTags('Users')
@Controller('users')
export class UserController {

    constructor(
        private userService: UserService,
        private readonly responseFactory: ResponseFactory,
        private readonly queryParamsFilterFactory: QueryParamsFilterFactory,
        private emailQueueProducer: EmailQueueProducer,
        private passwordService: PasswordService,
        private readonly foodService: FoodService,
        @InjectModel('Food')
        private readonly foodModel: Model<Food>,
        @InjectModel('Program')
        private readonly programModel: Model<Program>
    ) { }

    //@ApiBearerAuth()
    //@UseGuards(AuthGuard('jwt'))
    @Get()
    @ApiQuery({ name: 'sort_direction', type: String, required: false, description: " ASC | DESC" })
    @ApiQuery({ name: 'sort_order', type: String, required: false })
    @ApiQuery({ name: 'limit', type: Number, required: false })
    @ApiQuery({ name: 'page', type: Number, required: false })
    @ApiQuery({ name: 'pagination', type: Boolean, required: false })
    async getAll(
        @Query() paginationDto: PaginationDto,
        @Query() sortDto: SortDto,
        @Query() userQueryParams: UserQueryParams,
        @Res() response: Response
    ): Promise<any> {

        if(!paginationDto.pagination || paginationDto.pagination === "false") {
            let users =  await this.userService.getAll(
                await this.queryParamsFilterFactory.filter(userQueryParams), sortDto.sort_order, sortDto.sort_direction
            );
            
            return this.responseFactory.ok(users, response);
        }
        
        return this.responseFactory.ok(await this.userService.getPaginated(
            await this.queryParamsFilterFactory.filter(userQueryParams),
            paginationDto.page,
            paginationDto.limit,
            sortDto.sort_order,
            sortDto.sort_direction
        ), response);
    }


    @Post('register')
    async create(
        @Body() createUserDto: CreateUserDto,
        @Res() response: Response
    ): Promise<any> {

        const checkUserAlreadyRegistered = await this.userService.checkUserAlreadyRegistered(createUserDto.email);
        if(checkUserAlreadyRegistered === true)
            return this.responseFactory.forbidden('User already exists', response);
        else {
                this.emailQueueProducer.add({
                    time: new Date(),
                    to: createUserDto.email,
                    from: 'proiectlicenta2021@gmail.com',
                    subject: 'Welcome',
                    template: 'welcome.html'
                });
        }

        const user = await this.userService.create(createUserDto);
        if(!user)
            return this.responseFactory.error({ _general: 'users.user_can`t_be_created' }, response);

        const userDailyPlan = await this.foodService.create(
            new Date(),
            new Date(),
            user.id,
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

        if(!userDailyPlan)
            return this.responseFactory.error({ _general: 'users.user_daily_plan_not_created' }, response);

        const token = await this.passwordService.createToken(createUserDto.email, user.id);
        
        //trebuie transmit token ul si la register
        return this.responseFactory.ok(user, response);
   
    }

    @Post('login')
    async login(
        @Res() response: Response,
        @Body() authDto: AuthDto
    ): Promise<any> {

        let user = await this.userService.getByEmail(authDto.email);

        if(!user)
            return this.responseFactory.notFound({ _general: 'auth.user_not_found' }, response);

        const isValid = await this.passwordService.comparePassword(authDto.password, user.password);

        if(!isValid)
            return this.responseFactory.notFound({ _general: 'auth.user_not_found' }, response);

        const token = await this.passwordService.createToken(authDto.email, user.id);

        await this.userService.updateUserFirstLoginField(user);
        user.firstLogin = false;

        return new ResponseFactory().ok({ "user": user, "token": token }, response);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Res() response: Response,
        @Body() updateUserDto: UpdateUserDto
    ): Promise<any> {
        
        let user = await this.userService.findOne(id);
        if(!user)
            return this.responseFactory.notFound({ _general: 'users.user_not_found' }, response);

        user = await this.userService.update(updateUserDto, id);
        if(user)
            return this.responseFactory.ok(user, response);

        return this.responseFactory.error({ _general: 'users.user_not_updated' }, response);

    }
    
    @Get(':id/userInfo')
    async getUserInfo(
        @Param('id') id: string,
        @Res() response: Response
    ): Promise<any> {
        
        const userInfo: UserInfo = await this.userService.getUserInfo(id);
        if(!userInfo)
            return this.responseFactory.notFound({ _general: 'users.userInfo_not_found'}, response);

        let program = {};

        if(userInfo['programId'] && userInfo['programId'] != ' ') {
            program = await this.programModel.findOne({
                _id: userInfo.programId
            });
            
            if(!program)
                return this.responseFactory.notFound({ _general: 'programs.program_not_found' }, response);
        }

        Object.assign(userInfo, { program });
        
        return this.responseFactory.ok(userInfo, response);
    }

    @Put(':id/addFoodItem')
    async addFoodItem(
        @Param('id') id: string,
        @Res() response: Response,
        @Body() updateUserFood: UpdateUserFoodDto
    ): Promise<any> {

        const user = await this.userService.findOne(id);
        if(!user)
            return this.responseFactory.notFound({ _general: 'users.user_not_found' }, response);

        const today = new Date();
        today.setUTCHours(0,0,0,0);

        let userMenus = await this.foodModel.find({ 
            userId: id,
            createdAt: { $gt: today } 
        });

        if(!userMenus)
            return this.responseFactory.notFound({ _general: 'users.userMenus_not_found'}, response);

        if(updateUserFood.breakfastItem && userMenus.length >= 1)
            userMenus[0]['breakfast'].push(updateUserFood.breakfastItem);
        if(updateUserFood.lunchItem)
            userMenus[0]['lunch'].push(updateUserFood.lunchItem);
        if(updateUserFood.dinnerItem)
            userMenus[0]['dinner'].push(updateUserFood.dinnerItem);
        if(updateUserFood.snackItem)
            userMenus[0]['snacks'].push(updateUserFood.snackItem);

        const newFood = await userMenus[0].save();        

        return this.responseFactory.ok(newFood, response);
    }

    @Delete(':id/deleteFoodItem')
    async deleteFoodItem(
        @Param('id') id: string,
        @Res() response: Response,
        @Body() deleteFoodItemDto: DeleteFoodItemDto
    ): Promise<any> {

        const user = await this.userService.findOne(id);
        if(!user)
            return this.responseFactory.notFound({ _general: 'users.user_not_found' }, response);

        const today = new Date();
        today.setUTCHours(0,0,0,0);

        let userMenus = await this.foodModel.findOne({ 
            userId: id,
            createdAt: { $gt: today } 
        });
        if(!userMenus)
            return this.responseFactory.notFound({ _general: 'users.userMenus_not_found'}, response);

        let mealTypeSearch;
        if(deleteFoodItemDto.mealType === MealType.breakfast)
            mealTypeSearch = MealType.breakfast;
        else if(deleteFoodItemDto.mealType === MealType.lunch)
            mealTypeSearch = MealType.lunch;
        else if(deleteFoodItemDto.mealType === MealType.dinner)
            mealTypeSearch = MealType.dinner;
        else if(deleteFoodItemDto.mealType === MealType.snacks)
            mealTypeSearch = MealType.snacks;
        else
            return this.responseFactory.error({ _general: 'users.deleteDto_mealType_has_wrong_form' }, response);

        for(let i = 0; i < userMenus[mealTypeSearch].length; i++)
           if(userMenus[mealTypeSearch][i]['id'] == deleteFoodItemDto.foodId && i === deleteFoodItemDto.indexDelete) {
               if(parseFloat(userMenus[mealTypeSearch][i]['chosen_serving_size']) > deleteFoodItemDto.nrOfServings) {
                    userMenus[mealTypeSearch][i]['chosen_serving_size'] = parseFloat(userMenus[mealTypeSearch][i]['chosen_serving_size']) + (-deleteFoodItemDto.nrOfServings);
                    const userMenusAlso = userMenus[mealTypeSearch][i];
                    userMenus[mealTypeSearch].splice(i, 1, userMenusAlso);
                    await userMenus.save();
               } else {
                    userMenus[mealTypeSearch].splice(i, 1);
                    await userMenus.save();
               }
           }
        
        return this.responseFactory.ok(userMenus, response);
    }

    @Post(':id/changePassword')
    async changePassword(
        @Param('id') id: string,
        @Body() changePasswordDto: ChangePasswordDto,
        @Res() response: Response
    ) {
        let user = await this.userService.findOne(id);
        if(!user)
            return this.responseFactory.notFound({ _general: 'users.user_not_found' }, response);
        
        const isValid = await this.passwordService.comparePassword(changePasswordDto.current_password, user.password);
        if(!isValid)
            return this.responseFactory.notFound({ _general: 'users.old_password_is_wrong' }, response);

        if(changePasswordDto.new_password.length < 6)
            return this.responseFactory.error({ _general: 'users.new_password_too_short' }, response);

        if(changePasswordDto.new_password !== changePasswordDto.confirm_password)
            return this.responseFactory.error({ _general: 'users.passwords don`t match'}, response);

        const password = await this.passwordService.generatePassword(changePasswordDto.new_password);
        user.password = password;

        user = await this.userService.updatePassword(user);
        if(!user)
            return this.responseFactory.error({ _general: 'users.password_didn`t change' }, response);

        return this.responseFactory.ok({ _general: 'users.password_changed' }, response);

    }

    @Get(':id/allMeals')
    async getAllUserMeals(
        @Param('id') id: string,
        @Res() response: Response
    ): Promise<any> {
        
        let user = await this.userService.findOne(id);
        if(!user)
            return this.responseFactory.notFound({ _general: 'users.user_not_found' }, response);

        const userMeals = await this.foodModel.find({
            userId : id         
        });

        if(!userMeals)
            return this.responseFactory.error({ _general: 'users.user_meals_not_found' }, response);

        return this.responseFactory.ok(userMeals, response);
    }

    @Put(':id/lastWeekMeals')
    async getUserLastWeekMeals(
        @Body() body: string,
        @Param('id') id: string,
        @Res() response: Response
    ): Promise<any> {

        let user = await this.userService.findOne(id);
        if(!user)
            return this.responseFactory.notFound({ _general: 'users.user_not_foung' }, response);
        
        const today = new Date();
        today.setUTCHours(0,0,0,0);
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);

        const userMeals = await this.foodModel.find({
            userId: id,
            createdAt: { $gt: lastWeek }
        })
            .sort({ createdAt: -1 })
        
        if(!userMeals)
            return this.responseFactory.notFound({ _general: 'users.user_meals_not_found' }, response);

        const history: Array<any> = [];
        let historyNumber = 0;

        for(let meal = 0; meal < userMeals.length && historyNumber < 7; meal++) {
            if(body['mealType'] === 'breakfast' && userMeals[meal]['breakfast'].length != 0) {
                for(let j = 0; j < userMeals[meal]['breakfast'].length && historyNumber < 7; j++) {
                    let ok = 0;
                    for(let k = 0; k < history.length; k++)
                        if(history[k]['id'] === userMeals[meal]['breakfast'][j]['id'])
                            ok = 1;
                    if(ok === 0) {
                        history.push(userMeals[meal]['breakfast'][j]);
                        historyNumber++;
                    }
                }
            }

            if(body['mealType'] === 'lunch' && userMeals[meal]['lunch'].length != 0) {
                for(let j = 0; j < userMeals[meal]['lunch'].length && historyNumber < 7; j++) {
                    let ok = 0;
                    for(let k = 0; k < history.length; k++)
                        if(history[k]['id'] === userMeals[meal]['lunch'][j]['id'])
                            ok = 1;
                    if(ok === 0) {
                        history.push(userMeals[meal]['lunch'][j]);
                        historyNumber++;
                    }
                }
            }

            if(body['mealType'] === 'dinner' && userMeals[meal]['dinner'].length != 0) {
                for(let j = 0; j < userMeals[meal]['dinner'].length && historyNumber < 7; j++) {
                    let ok = 0;
                    for(let k = 0; k < history.length; k++)
                        if(history[k]['id'] === userMeals[meal]['dinner'][j]['id'])
                            ok = 1;
                    if(ok === 0) {
                        history.push(userMeals[meal]['dinner'][j]);
                        historyNumber++;
                    }
                }
            }

            if(body['mealType'] === 'snacks' && userMeals[meal]['snacks'].length != 0) {
                for(let j = 0; j < userMeals[meal]['snacks'].length && historyNumber < 7; j++) {
                    let ok = 0;
                    for(let k = 0; k < history.length; k++)
                        if(history[k]['id'] === userMeals[meal]['snacks'][j]['id'])
                            ok = 1;
                    if(ok === 0) {
                        history.push(userMeals[meal]['snacks'][j]);
                        historyNumber++;
                    }
                }
            }
        }

        return this.responseFactory.ok(history, response);
    }

    @Get(':id/todayMeals')
    async getUserTodayMeals(
        @Param('id') id: string,
        @Res() response: Response
    ): Promise<any> {
        
        let user = await this.userService.findOne(id);
        if(!user)
            return this.responseFactory.notFound({ _general: 'users.user_not_found' }, response);

        const today = new Date();
        today.setUTCHours(0,0,0,0);

        const todayUserMeals = await this.foodModel.findOne({ 
            userId: id,
            createdAt: { $gt: today } 
        });

        if(!todayUserMeals)
            return this.responseFactory.error({ _general: 'users.user_today_meals_not_found'}, response);

        return this.responseFactory.ok(todayUserMeals, response);
    }

    @Get(':id/last7DaysMeals')
    async getLast7DaysMeals(
        @Param('id') id:string,
        @Res() response: Response
    ): Promise<any> {

        let user = await this.userService.findOne(id);
        if(!user)
            return this.responseFactory.notFound({ _general: 'users.user_not_found '}, response);

        const today = new Date();
        today.setUTCHours(0,0,0,0);
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
    
        const userMeals = await this.foodModel.find({
            userId: id,
            createdAt: { $gt: lastWeek }
        })
            .sort({ createdAt: -1 })

        if(!userMeals)
            return this.responseFactory.notFound({ _general: "users.meals_not_found" }, response);
        
        return this.responseFactory.ok(userMeals, response);
    }

    @Put(':id/updateWorkout')
    async updateWorkout(
        @Param('id') id: string,
        @Body() updateWorkoutDto: UpdateWorkoutDto,
        @Res() response: Response
    ): Promise<any> {

        let user = await this.userService.findOne(id);
        if(!user)
            return this.responseFactory.notFound({ _general: 'users.user_not_foung' }, response);
        
        const today = new Date();
        today.setUTCHours(0,0,0,0);

        const todayUserMeals = await this.foodModel.findOne({
            userId: id,
            createdAt: { $gt: today }
        })

        if(!todayUserMeals)
            return this.responseFactory.error({ _general: 'users.user_today_meals_not_found'}, response);

        todayUserMeals.workout = todayUserMeals.workout + updateWorkoutDto.workoutVal;
        const updateWorkout = await todayUserMeals.save(); 
        if(!updateWorkout)
            return this.responseFactory.error({ _general: 'user.update_workout_didnt_work' }, response);

        return this.responseFactory.ok(updateWorkout, response);

    }

    @Get(':id/lastWeekNutrients')
    async getLastWeekNutrients(
        @Param('id') id: string,
        @Res() response: Response
    ): Promise<any> {

        let dailyNutrientsArray = [];
        let user = await this.userService.findOne(id);
        if(!user)
            return this.responseFactory.notFound({ _general: 'users.user_not_found '}, response);

        const today = new Date();
        today.setUTCHours(0,0,0,0);
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);

        const userMeals = await this.foodModel.find({
            userId: id,
            createdAt: { $gt: lastWeek }
        })
            .sort({ createdAt: -1 })

        if(!userMeals)
            return this.responseFactory.notFound({ _general: "users.meals_not_found" }, response);

        for(let meal = 0; meal < userMeals.length; meal++) {
            
            let nutrients = await this.userService.getADayNutrients(userMeals[meal]);

            if(userMeals[meal]['workout'])
               nutrients['workoutValue'] = userMeals[meal]['workout'];
            else
                nutrients['workoutValue'] = 0;
            
            dailyNutrientsArray.push(nutrients);
        }

        return this.responseFactory.ok(dailyNutrientsArray, response);

    }

    @Get(':id/todayNutrients')
    async getUserTodayNutrients(
        @Param('id') id: string,
        @Res() response: Response
    ): Promise<any> {

        let user = await this.userService.findOne(id);
        if(!user)
            return this.responseFactory.notFound({ _general: 'users.user_not_found' }, response);

        const today = new Date();
        today.setUTCHours(0,0,0,0);

        const todayUserMeals = await this.foodModel.findOne({ 
            userId: id,
            createdAt: { $gt: today } 
        });

        let nutrients = await this.userService.getADayNutrients(todayUserMeals);
        return this.responseFactory.ok(nutrients, response);
    }

    @Put(':id/setNoTrophies')
    async setNoTrophies(
        @Param('id') id: string,
        @Res() response: Response
    ): Promise<any> {

        let user = await this.userService.findOne(id);
        if(!user)
            return this.responseFactory.notFound({ _general: 'users.user_not_found' }, response);

        user = await this.userService.updateTrophiesValue(user);
        if(!user)
            return this.responseFactory.error({ _general: 'users.user_not_updated' }, response);

        return this.responseFactory.ok(user, response);
    }

    @Get(':id/trophies')
    async getTrophies(
        @Param('id') id: string,
        @Res() response: Response
    ): Promise<any> {

        let user = await this.userService.findOne(id);
        if(!user)
            return this.responseFactory.notFound({ _general: 'users.user_not_found' }, response);

        const userTrophies = await this.userService.findUserTrophies(id);
        if(!userTrophies)
            return this.responseFactory.notFound({ _general: 'users.user_trophies_not_found' }, response);

        return this.responseFactory.ok(userTrophies, response);
    }

}