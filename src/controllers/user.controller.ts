import { Controller, Post, Body, Get, Put, Delete, Param, Res} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { ApiTags } from "@nestjs/swagger";
import { CreateUserDto } from '../dtos/createUser.dto';
import { ResponseFactory } from '../factories/ResponseFactory';
import { Response } from 'express';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailQueueProducer } from '../producers/emailQueueProducer';


@ApiTags('Users')
@Controller('users')
export class UserController {

    constructor(
        private userService: UserService,
        private readonly responseFactory: ResponseFactory,
        private emailQueueProducer: EmailQueueProducer,
    ) { }

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