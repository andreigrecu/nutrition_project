import { Controller, Post, Body, Get, Put, Delete,Param, Res} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { CreateUserDto } from '../dtos/createUser.dto';
import { ResponseFactory } from '../factories/ResponseFactory';
import { Response } from 'express';
import { User } from '../entities/user';

@ApiTags('Users')
@Controller('users')
export class UserController {

    constructor(
        private userService: UserService,
        private readonly responseFactory: ResponseFactory
    ) { }

    @Post('register')
    async create(
        @Body() createUserDto: CreateUserDto,
        @Res() response: Response
    ): Promise<any> {

        const checkUserAlreadyRegistered = await this.userService.checkUserAlreadyRegistered(createUserDto.email);
        if(checkUserAlreadyRegistered === true)
            return this.responseFactory.forbidden('User already exists', response);

        const user = await this.userService.create(createUserDto);

        if(user)
           return this.responseFactory.ok(user, response);
        
        return this.responseFactory.notFound({ general_: 'users.user_can`t_be_created' }, response);
    }
}