import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user';
import { CreateUserDto } from '../dtos/createUser.dto';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User) 
        private userRepository: Repository<User>
    ) { }

    async find(): Promise<User[]> {
        const users = await this.userRepository.find();
        return users;
    }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const user = await this.userRepository.save(createUserDto);
        return user;
    }
    
}