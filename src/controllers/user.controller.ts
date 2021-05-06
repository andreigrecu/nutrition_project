import { Controller, Post, Body, Get, Res, Query, Put, Param} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { ApiTags, ApiQuery } from "@nestjs/swagger";
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
import { UserInfoService } from '../services/userInfo.service';
import { UpdateUserFoodDto } from '../dtos/updateUserFood.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Food } from '../models/food.model';
import { FoodService } from '../services/food.service';
import { ChangePasswordDto } from '../dtos/changePassword.dto';

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
    ) { }

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
            []
        )

        if(!userDailyPlan)
            return this.responseFactory.error({ _general: 'users.user_daily_plan_not_created' }, response);
        
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

        //use it to auth on swagger, later
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

    @Post(':id/change-password')
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

        const todayUserMeals = await this.foodModel.find({ 
            userId: id,
            createdAt: { $gt: today } 
        });

        if(!todayUserMeals)
            return this.responseFactory.error({ _general: 'users.user_today_meals_not_found'}, response);

        return this.responseFactory.ok(todayUserMeals, response);
    }

    @Get(':id/todayNutrients')
    async getUserTodayNutrients(
        @Param('id') id: string,
        @Res() response: Response
    ): Promise<any> {

        let breakfastCalories = 0;
        let lunchCalories = 0;
        let dinnerCalories = 0;
        let snacksCalories = 0;
        let totalCalories = 0;

        let breakfastCarbohydrates = 0;
        let lunchCarbohydrates = 0;
        let dinnerCarbohydrates = 0;
        let snacksCarbohydrates = 0;
        let totalCarbohydrates = 0;

        let breakfastFats = 0;
        let lunchFats = 0;
        let dinnerFats = 0;
        let snacksFats = 0;
        let totalFats = 0;

        let breakfastProteins = 0;
        let lunchProteins = 0;
        let dinnerProteins = 0;
        let snacksProteins = 0;
        let totalProteins = 0;

        let user = await this.userService.findOne(id);
        if(!user)
            return this.responseFactory.notFound({ _general: 'users.user_not_found' }, response);

        const today = new Date();
        today.setUTCHours(0,0,0,0);

        const todayUserMeals = await this.foodModel.findOne({ 
            userId: id,
            createdAt: { $gt: today } 
        });

        for(let breakfastItem = 0; breakfastItem < todayUserMeals['breakfast'].length; breakfastItem++) {
            for(let j = 0; j < todayUserMeals['breakfast'][breakfastItem]['nutrition']['nutrients'].length; j++) {
                let nutrientAmount = todayUserMeals['breakfast'][breakfastItem]['nutrition']['nutrients'][j]['amount'];
                let servingsNr = 1;
                if(todayUserMeals['breakfast'][breakfastItem]['chosen_serving_size'])
                    servingsNr = todayUserMeals['breakfast'][breakfastItem]['chosen_serving_size'];
                switch(todayUserMeals['breakfast'][breakfastItem]['nutrition']['nutrients'][j]['name']) {
                    case 'Calories':
                        breakfastCalories += nutrientAmount * servingsNr;
                        break;
                    case 'Carbohydrates':
                        breakfastCarbohydrates += nutrientAmount * servingsNr;
                        break;
                    case 'Fats':
                        breakfastFats += nutrientAmount * servingsNr;
                        break;
                    case 'Fat':
                        breakfastFats += nutrientAmount * servingsNr;
                        break;
                    case 'Proteins':
                        breakfastProteins += nutrientAmount * servingsNr;
                        break;
                    case 'Protein':
                        breakfastProteins += nutrientAmount * servingsNr;
                        break;
                    default: 
                        //console.log("Entered default case in breakfast switch");
                }
            }
        }

        for(let lunchItem = 0; lunchItem < todayUserMeals['lunch'].length; lunchItem++) {
            for(let j = 0; j < todayUserMeals['lunch'][lunchItem]['nutrition']['nutrients'].length; j++) {
                let nutrientAmount = todayUserMeals['lunch'][lunchItem]['nutrition']['nutrients'][j]['amount'];
                let servingsNr = 1;
                if(todayUserMeals['lunch'][lunchItem]['chosen_serving_size'])
                    servingsNr = todayUserMeals['lunch'][lunchItem]['chosen_serving_size'];
                switch(todayUserMeals['lunch'][lunchItem]['nutrition']['nutrients'][j]['name']) {
                    case 'Calories':
                        lunchCalories += nutrientAmount * servingsNr;
                        break;
                    case 'Carbohydrates':
                        lunchCarbohydrates += nutrientAmount * servingsNr;
                        break;
                    case 'Fats':
                        lunchFats += nutrientAmount * servingsNr;
                        break;
                    case 'Fat':
                        lunchFats += nutrientAmount * servingsNr;
                        break;
                    case 'Proteins':
                        lunchProteins += nutrientAmount * servingsNr;
                        break;
                    case 'Protein':
                        lunchProteins += nutrientAmount * servingsNr;
                        break;
                    default: 
                        //console.log("Entered default case in lunch switch");
                }
            }
        }

        for(let dinnerItem = 0; dinnerItem < todayUserMeals['dinner'].length; dinnerItem++) {
            for(let j = 0; j < todayUserMeals['dinner'][dinnerItem]['nutrition']['nutrients'].length; j++) {
                let nutrientAmount = todayUserMeals['dinner'][dinnerItem]['nutrition']['nutrients'][j]['amount'];
                let servingsNr = 1;
                if(todayUserMeals['dinner'][dinnerItem]['chosen_serving_size'])
                    servingsNr = todayUserMeals['dinner'][dinnerItem]['chosen_serving_size'];
                switch(todayUserMeals['dinner'][dinnerItem]['nutrition']['nutrients'][j]['name']) {
                    case 'Calories':
                        dinnerCalories += nutrientAmount * servingsNr;
                        break;
                    case 'Carbohydrates':
                        dinnerCarbohydrates += nutrientAmount * servingsNr;
                        break;
                    case 'Fats':
                        dinnerFats += nutrientAmount * servingsNr;
                        break;
                    case 'Fat':
                        dinnerFats += nutrientAmount * servingsNr;
                        break;
                    case 'Proteins':
                        dinnerProteins += nutrientAmount * servingsNr;
                        break;
                    case 'Protein':
                        dinnerProteins += nutrientAmount * servingsNr;
                        break;
                    default: 
                        //console.log("Entered default case in dinner switch");
                }
            }
        }

        for(let snack = 0; snack < todayUserMeals['snacks'].length; snack++) {
            for(let j = 0; j < todayUserMeals['snacks'][snack]['nutrition']['nutrients'].length; j++) {
                let nutrientAmount = todayUserMeals['snacks'][snack]['nutrition']['nutrients'][j]['amount'];
                let servingsNr = 1;
                if(todayUserMeals['snacks'][snack]['chosen_serving_size'])
                    servingsNr = todayUserMeals['snacks'][snack]['chosen_serving_size'];
                switch(todayUserMeals['snacks'][snack]['nutrition']['nutrients'][j]['name']) {
                    case 'Calories':
                        snacksCalories += nutrientAmount * servingsNr;
                        break;
                    case 'Carbohydrates':
                        snacksCarbohydrates += nutrientAmount * servingsNr;
                        break;
                    case 'Fats':
                        snacksFats += nutrientAmount * servingsNr;
                        break;
                    case 'Fat':
                        snacksFats += nutrientAmount * servingsNr;
                        break;
                    case 'Proteins':
                        snacksProteins += nutrientAmount * servingsNr;
                        break;
                    case 'Protein':
                        snacksProteins += nutrientAmount * servingsNr;
                        break;
                    default: 
                        //console.log("Entered default case in dinner switch");
                }
            }
        }

        totalCalories = breakfastCalories + lunchCalories + dinnerCalories + snacksCalories;
        totalCarbohydrates = breakfastCarbohydrates + lunchCarbohydrates + dinnerCarbohydrates + snacksCarbohydrates;
        totalFats = breakfastFats + lunchFats + dinnerFats + snacksFats;
        totalProteins = breakfastProteins + lunchProteins + dinnerProteins + snacksProteins;

        let calories = {
            breakfastCalories,
            lunchCalories,
            dinnerCalories,
            snacksCalories,
            totalCalories
        };

        let carbohydrates = {
            breakfastCarbohydrates,
            lunchCarbohydrates,
            dinnerCarbohydrates,
            snacksCarbohydrates,
            totalCarbohydrates
        }

        let fats = {
            breakfastFats,
            lunchFats,
            dinnerFats,
            snacksFats,
            totalFats
        }

        let proteins = {
            breakfastProteins,
            lunchProteins,
            dinnerProteins,
            snacksProteins,
            totalProteins
        }

        let nutrients = {
            calories,
            carbohydrates,
            fats,
            proteins
        }

        return this.responseFactory.ok(nutrients, response);
    }

}