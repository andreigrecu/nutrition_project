import { Controller, Post, Body, Get, Put, Delete,Param, Res} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { CreateUserDto } from '../dtos/createUser.dto';
import { ResponseFactory } from '../factories/ResponseFactory';
import { Response } from 'express';

@ApiTags('Users')
@Controller('users')
export class UserController {

    constructor(
        private userService: UserService,
        private readonly responseFactory: ResponseFactory
    ) { }

    @Get()
    async getOne(
        @Res() response: Response
    ): Promise<any> {
        const all = await this.userService.find();
        return this.responseFactory.ok(all, response);
    }

    @Post()
    async create(
        @Body() createUserDto: CreateUserDto,
        @Res() response: Response
    ): Promise<any> {
        const ceva = await this.userService.createUser(createUserDto);567890
        return this.responseFactory.ok(ceva, response);
    }
}