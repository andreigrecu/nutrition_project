import { Controller, Post, Body, Get, Res, Query, Put} from '@nestjs/common';
import { ApiTags } from "@nestjs/swagger";
import { UserInfoService } from '../services/userInfo.service';
import { ResponseFactory } from '../factories/ResponseFactory';
import { Response } from 'express';
import { UserService } from '../services/user.service';
import { CreateUserInfoDto } from '../dtos/createUserInfo.dto';
import { UpdateUserInfoDto } from '../dtos/updateUserInfo.dto';

@ApiTags('UsersInfo')
@Controller('usersInfo')
export class UserInfoController {

    constructor(
        private userInfoService: UserInfoService,
        private readonly userService: UserService,
        private readonly responseFactory: ResponseFactory
    ) { }

    @Post()
    async create(
        @Body() createUserInfoDto: CreateUserInfoDto,
        @Res() response: Response
    ): Promise<any> {

        const user = await this.userService.findOne(createUserInfoDto.userId);
        if(!user)
            return this.responseFactory.notFound({ _general: 'users.user_not_found' }, response);

        let userInfo = await this.userInfoService.findOne(createUserInfoDto.userId);
        if(userInfo)
            return this.responseFactory.error({ _general: 'usersInfo.userInfo_already_exists' }, response);

        userInfo = await this.userInfoService.create(createUserInfoDto);
        
        if(userInfo)
            return this.responseFactory.ok(userInfo, response);
        
        return this.responseFactory.error({ _general: 'usersInfo.userInfo_can`t_be_created' }, response);
    }

    @Put()
    async update(
        @Body() updateUserInfoDto: UpdateUserInfoDto,
        @Res() response: Response
    ): Promise<any> {

        const user = await this.userService.findOne(updateUserInfoDto.userId);
        if(!user)
            return this.responseFactory.notFound({ _general: 'users.user_not_found' }, response);

        let userInfo = await this.userInfoService.findOne(updateUserInfoDto.userId);
        if(!userInfo)
            return this.responseFactory.notFound({ _general: 'usersInfo.userInfo_not_found' }, response);        

        userInfo = await this.userInfoService.update(updateUserInfoDto, userInfo.id);
        if(userInfo)
            return this.responseFactory.ok(userInfo, response);

        return this.responseFactory.error({ _general: 'usersInfo.userInfo_not_updated' }, response);
    }

    @Get()
    async get(
        @Res() response: Response
    ): Promise<any> {

        const usersInfo = await this.userInfoService.getAll();

        if(!usersInfo)
            return this.responseFactory.notFound({ _general: 'usersInfo.usersInfos_not_found' }, response);

        return this.responseFactory.ok(usersInfo, response);
    }
}