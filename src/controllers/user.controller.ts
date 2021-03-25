import { Controller, Post, Body, Get, Put, Delete, Param, Res, Query} from '@nestjs/common';
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

@ApiTags('Users')
@Controller('users')
export class UserController {

    constructor(
        private userService: UserService,
        private readonly responseFactory: ResponseFactory,
        private readonly queryParamsFilterFactory: QueryParamsFilterFactory,
        private emailQueueProducer: EmailQueueProducer,
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

        console.log(paginationDto)
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
                    to: 'netec84017@gameqo.com',
                    from: 'proiectlicenta2021@gmail.com',
                    subject: 'Let`s test email service',
                    template: 'mainTemplate.html'
                });
        }

        const user = await this.userService.create(createUserDto);

        if(user)
           return this.responseFactory.ok(user, response);
        
        return this.responseFactory.error({ general_: 'users.user_can`t_be_created' }, response);
    }
}