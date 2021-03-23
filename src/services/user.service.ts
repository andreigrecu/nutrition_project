import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user';
import { CreateUserDto } from '../dtos/createUser.dto';
import { PasswordService } from './password.service';
import { check } from 'prettier';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User) 
        private userRepository: Repository<User>,
        private readonly passwordService: PasswordService
    ) { }


    async checkUserAlreadyRegistered(
        email: string
    ): Promise<Boolean> {

        const checkUserAlreadyRegistered = await this.userRepository.findOne({
            where: {
                email
            }
        });

        if(checkUserAlreadyRegistered)
            return true;

        return false;
    }

    async create(
        createUserDto: CreateUserDto
    ): Promise<User> {

        const password = await this.passwordService.generatePassword(createUserDto.password);

        let user: User = new User();
        user.firstName = createUserDto.firstName;
        user.lastName = createUserDto.lastName;
        user.email = createUserDto.email;
        user.password = password;
        user.birthday = new Date(createUserDto.birthday);
            
        return await this.userRepository.save(user);
    }
    
}