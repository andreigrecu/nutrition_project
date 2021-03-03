import { Controller, Post, Body, Get, Put, Delete,Param} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { CreateUserDto } from '../dtos/createUser.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {

    constructor(
        private userService: UserService,
    ) { }

    @Get()
    async getOne(): Promise<any> {
        return await this.userService.find();
    }

    @Post()
    async create(
        @Body() createUserDto: CreateUserDto,
    ): Promise<any> {
        const ceva = await this.userService.createUser(createUserDto);567890
        return ceva;
    }
}