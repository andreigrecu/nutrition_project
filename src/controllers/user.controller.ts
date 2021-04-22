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

@ApiTags('Users')
@Controller('users')
export class UserController {

    constructor(
        private userService: UserService,
        private readonly responseFactory: ResponseFactory,
        private readonly queryParamsFilterFactory: QueryParamsFilterFactory,
        private emailQueueProducer: EmailQueueProducer,
        private passwordService: PasswordService,
        private userInfoService: UserInfoService
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
                    to: 'viyac28906@yncyjs.com',
                    from: 'proiectlicenta2021@gmail.com',
                    subject: 'Let`s test email service',
                    template: 'mainTemplate.html'
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

}