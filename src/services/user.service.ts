import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user';
import { CreateUserDto } from '../dtos/createUser.dto';
import { PasswordService } from './password.service';
import { Order } from '../common/order';
import { UpdateUserDto } from '../dtos/updateUser.dto';
import { UserInfo } from '../entities/userInfo';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User) 
        private userRepository: Repository<User>,
        @InjectRepository(UserInfo) 
        private userInfoRepository: Repository<UserInfo>,
        private readonly passwordService: PasswordService,
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
        user.firstLogin = true;
        
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

    async getAllUnfiltered(
    ): Promise<User[]> {
        return await this.userRepository.find();
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

    async getByEmail(
        email: String
    ): Promise<User> {

        return await this.userRepository.findOne({
            where: {
                email: email
            }
        });
    }

    async update(
       updateUserDto: UpdateUserDto,
       id: string
    ): Promise<any> {

        let updateUser: UpdateUserDto = this.userRepository.create();
        updateUser.firstLogin = false;
        if(updateUserDto.firstName)
            updateUser.firstName = updateUserDto.firstName;
        if(updateUserDto.lastName)
            updateUser.lastName = updateUserDto.lastName;
        if(updateUserDto.email)
            updateUser.email = updateUserDto.email;

        return this.userRepository.update(id, updateUser);

    }

    async updateUserFirstLoginField(
        user: User
    ): Promise<any> {
        return this.userRepository.update(user.id, {firstLogin: false});
    }

    async findOne(
        id: string
    ): Promise<User> {
        return await this.userRepository.findOne(id);
    }

    async getUserInfo(
        id: string
    ): Promise<UserInfo> {
        return await this.userInfoRepository.findOne({
            where:{
                userId: id
        }})
    }
    
}