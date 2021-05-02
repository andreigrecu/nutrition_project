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

        if(user)
           return this.responseFactory.ok(user, response);
        
        return this.responseFactory.error({ _general: 'users.user_can`t_be_created' }, response);
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

        let userMenus = await this.foodModel.find({ userId: id });
        if(!userMenus)
            return this.responseFactory.notFound({ _general: 'users.userMenus_not_found'}, response);

        for(let i = 0; i < userMenus.length; i++) {
            if(Math.abs(userMenus[i]['createdAt'].getTime() - new Date().getTime()) > 86400000)
                userMenus.splice(i);
        }

        if(updateUserFood.breakfastItem)
            userMenus[0]['breakfast'].push(updateUserFood.breakfastItem);
        if(updateUserFood.lunchItem)
            userMenus[0]['lunch'].push(updateUserFood.lunchItem);
        if(updateUserFood.dinnerItem)
            userMenus[0]['dinner'].push(updateUserFood.dinnerItem);
        if(updateUserFood.snackItem)
            userMenus[0]['snacks'].push(updateUserFood.snackItem);

        const ceva = await userMenus[0].save();        

        return this.responseFactory.ok(ceva, response);
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

        console.log(changePasswordDto.new_password)
        console.log(changePasswordDto.new_password.length)
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

}