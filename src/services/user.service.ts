import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user';
import { CreateUserDto } from '../dtos/createUser.dto';
import { PasswordService } from './password.service';
import { Order } from '../common/order';

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
        user.birthday =  new Date(createUserDto.birthday);
        user.birthday.setHours(0,0,0,0);
            
        return await this.userRepository.save(user);
    }

    async getAll(
        filter: any, 
        sort_order: string = "id", 
        sort_direction: Order = Order.ASC
    ): Promise<User[]> {

        const orderBy = {};
        orderBy[sort_order] = sort_direction;

        let users = await this.userRepository.find({
            order: orderBy,
            where: filter
        })
        return users;
    }

    async getPaginated(
        filters: any,
        page: number = 1,
        page_size: number = 10,
        sort_order: string = "id",
        sort_direction: Order = Order.ASC
    ) {
        const skippedItems = (page - 1) * page_size;
        let query = await this.userRepository.createQueryBuilder("user")
            .where(await filters)
            .orderBy("user." + sort_order, sort_direction)
            .offset(skippedItems)
            .limit(skippedItems)
            .take(page_size);

        const users = await query.getMany();

        const totalCount = await this.userRepository.count({ where: filters });
        const totalPages = Math.ceil(totalCount / page_size);

        return {
            page: page,
            page_size: totalCount,
            limitRows: page_size,
            totalPages,
            sort_order,
            sort_direction,
            data: users
        }
    }
    
}