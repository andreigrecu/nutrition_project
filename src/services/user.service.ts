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

    async updatePassword(
        user: User
    ): Promise<any> {
        return this.userRepository.save(user);
    }

    async updateUserFirstLoginField(
        user: User
    ): Promise<any> {
        return this.userRepository.update(user.id, {firstLogin: false});
    }

    async updateTrophiesValue(
        user: User
    ): Promise<any> {
        return this.userRepository.update(user.id, {newTrophy: false});
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

    async findUserTrophies(
        id: string
    ): Promise<any> {
        const userTrophies = await this.userRepository.findOne(id, {
            relations: [
                'trophies'
            ],
        });

        return userTrophies;
    }
    
    async getADayNutrients(
        meals: any
    ): Promise<any> {

        let breakfastCalories = 0;
        let lunchCalories = 0;
        let dinnerCalories = 0;
        let snacksCalories = 0;
        let totalCalories = 0;

        let breakfastCarbohydrates = 0;
        let lunchCarbohydrates = 0;
        let dinnerCarbohydrates = 0;
        let snacksCarbohydrates = 0;
        let totalCarbohydrates = 0;

        let breakfastFats = 0;
        let lunchFats = 0;
        let dinnerFats = 0;
        let snacksFats = 0;
        let totalFats = 0;

        let breakfastProteins = 0;
        let lunchProteins = 0;
        let dinnerProteins = 0;
        let snacksProteins = 0;
        let totalProteins = 0;


        for(let breakfastItem = 0; breakfastItem < meals['breakfast'].length; breakfastItem++) {
            for(let j = 0; j < meals['breakfast'][breakfastItem]['nutrition']['nutrients'].length; j++) {
                let nutrientAmount = meals['breakfast'][breakfastItem]['nutrition']['nutrients'][j]['amount'];
                let servingsNr = 1;
                if(meals['breakfast'][breakfastItem]['chosen_serving_size'])
                    servingsNr = meals['breakfast'][breakfastItem]['chosen_serving_size'];
                switch(meals['breakfast'][breakfastItem]['nutrition']['nutrients'][j]['name']) {
                    case 'Calories':
                        breakfastCalories += nutrientAmount * servingsNr;
                        break;
                    case 'Carbohydrates':
                        breakfastCarbohydrates += nutrientAmount * servingsNr;
                        break;
                    case 'Fats':
                        breakfastFats += nutrientAmount * servingsNr;
                        break;
                    case 'Fat':
                        breakfastFats += nutrientAmount * servingsNr;
                        break;
                    case 'Proteins':
                        breakfastProteins += nutrientAmount * servingsNr;
                        break;
                    case 'Protein':
                        breakfastProteins += nutrientAmount * servingsNr;
                        break;
                    default: 
                        //console.log("Entered default case in breakfast switch");
                }
            }
        }

        for(let lunchItem = 0; lunchItem < meals['lunch'].length; lunchItem++) {
            for(let j = 0; j < meals['lunch'][lunchItem]['nutrition']['nutrients'].length; j++) {
                let nutrientAmount = meals['lunch'][lunchItem]['nutrition']['nutrients'][j]['amount'];
                let servingsNr = 1;
                if(meals['lunch'][lunchItem]['chosen_serving_size'])
                    servingsNr = meals['lunch'][lunchItem]['chosen_serving_size'];
                switch(meals['lunch'][lunchItem]['nutrition']['nutrients'][j]['name']) {
                    case 'Calories':
                        lunchCalories += nutrientAmount * servingsNr;
                        break;
                    case 'Carbohydrates':
                        lunchCarbohydrates += nutrientAmount * servingsNr;
                        break;
                    case 'Fats':
                        lunchFats += nutrientAmount * servingsNr;
                        break;
                    case 'Fat':
                        lunchFats += nutrientAmount * servingsNr;
                        break;
                    case 'Proteins':
                        lunchProteins += nutrientAmount * servingsNr;
                        break;
                    case 'Protein':
                        lunchProteins += nutrientAmount * servingsNr;
                        break;
                    default: 
                        //console.log("Entered default case in lunch switch");
                }
            }
        }

        for(let dinnerItem = 0; dinnerItem < meals['dinner'].length; dinnerItem++) {
            for(let j = 0; j < meals['dinner'][dinnerItem]['nutrition']['nutrients'].length; j++) {
                let nutrientAmount = meals['dinner'][dinnerItem]['nutrition']['nutrients'][j]['amount'];
                let servingsNr = 1;
                if(meals['dinner'][dinnerItem]['chosen_serving_size'])
                    servingsNr = meals['dinner'][dinnerItem]['chosen_serving_size'];
                switch(meals['dinner'][dinnerItem]['nutrition']['nutrients'][j]['name']) {
                    case 'Calories':
                        dinnerCalories += nutrientAmount * servingsNr;
                        break;
                    case 'Carbohydrates':
                        dinnerCarbohydrates += nutrientAmount * servingsNr;
                        break;
                    case 'Fats':
                        dinnerFats += nutrientAmount * servingsNr;
                        break;
                    case 'Fat':
                        dinnerFats += nutrientAmount * servingsNr;
                        break;
                    case 'Proteins':
                        dinnerProteins += nutrientAmount * servingsNr;
                        break;
                    case 'Protein':
                        dinnerProteins += nutrientAmount * servingsNr;
                        break;
                    default: 
                        //console.log("Entered default case in dinner switch");
                }
            }
        }

        for(let snack = 0; snack < meals['snacks'].length; snack++) {
            for(let j = 0; j < meals['snacks'][snack]['nutrition']['nutrients'].length; j++) {
                let nutrientAmount = meals['snacks'][snack]['nutrition']['nutrients'][j]['amount'];
                let servingsNr = 1;
                if(meals['snacks'][snack]['chosen_serving_size'])
                    servingsNr = meals['snacks'][snack]['chosen_serving_size'];
                switch(meals['snacks'][snack]['nutrition']['nutrients'][j]['name']) {
                    case 'Calories':
                        snacksCalories += nutrientAmount * servingsNr;
                        break;
                    case 'Carbohydrates':
                        snacksCarbohydrates += nutrientAmount * servingsNr;
                        break;
                    case 'Fats':
                        snacksFats += nutrientAmount * servingsNr;
                        break;
                    case 'Fat':
                        snacksFats += nutrientAmount * servingsNr;
                        break;
                    case 'Proteins':
                        snacksProteins += nutrientAmount * servingsNr;
                        break;
                    case 'Protein':
                        snacksProteins += nutrientAmount * servingsNr;
                        break;
                    default: 
                        //console.log("Entered default case in dinner switch");
                }
            }
        }

        totalCalories = breakfastCalories + lunchCalories + dinnerCalories + snacksCalories;
        totalCarbohydrates = breakfastCarbohydrates + lunchCarbohydrates + dinnerCarbohydrates + snacksCarbohydrates;
        totalFats = breakfastFats + lunchFats + dinnerFats + snacksFats;
        totalProteins = breakfastProteins + lunchProteins + dinnerProteins + snacksProteins;

        let calories = {
            breakfastCalories,
            lunchCalories,
            dinnerCalories,
            snacksCalories,
            totalCalories
        };

        let carbohydrates = {
            breakfastCarbohydrates,
            lunchCarbohydrates,
            dinnerCarbohydrates,
            snacksCarbohydrates,
            totalCarbohydrates
        }

        let fats = {
            breakfastFats,
            lunchFats,
            dinnerFats,
            snacksFats,
            totalFats
        }

        let proteins = {
            breakfastProteins,
            lunchProteins,
            dinnerProteins,
            snacksProteins,
            totalProteins
        }

        let nutrients = {
            calories,
            carbohydrates,
            fats,
            proteins,
            workout: meals['workout']
        }

        return nutrients;
    }

}