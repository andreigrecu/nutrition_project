import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserInfoDto } from '../dtos/createUserInfo.dto';
import { Repository } from 'typeorm';
import { UserInfo } from '../entities/userInfo';
import { UpdateUserInfoDto } from '../dtos/updateUserInfo.dto';

@Injectable()
export class UserInfoService {

    constructor(
        @InjectRepository(UserInfo) 
        private userInfoRepository: Repository<UserInfo>,
    ) { }

    async create(
        createUserInfoDro: CreateUserInfoDto
    ): Promise<UserInfo> {

        let userInfo: UserInfo = new UserInfo();
        userInfo.age = createUserInfoDro.age;
        userInfo.height = createUserInfoDro.height;
        userInfo.weight = createUserInfoDro.weight;
        userInfo.weighGoal = createUserInfoDro.weightGoal;
        userInfo.numberOfDaysGoal = createUserInfoDro.numberOfDaysGoal;
        userInfo.userId = createUserInfoDro.userId;
        userInfo.gender = createUserInfoDro.gender;

        return await this.userInfoRepository.save(userInfo);
    }

    async findOne(
        id: string
    ): Promise<UserInfo> {
        return await this.userInfoRepository.findOne({where: {
            userId: id
        }});
    }

    async getAll(   
    ): Promise<UserInfo[]> {
        return await this.userInfoRepository.find();
    }

    async update(
        updateUserInfoDto: UpdateUserInfoDto,
        id: string
    ): Promise<any> {

        let updateUserInfo: UserInfo = this.userInfoRepository.create();
        if(updateUserInfoDto.age)
            updateUserInfo.age = updateUserInfoDto.age;
        if(updateUserInfoDto.height)
            updateUserInfo.height = updateUserInfoDto.height;
        if(updateUserInfo.weight)
            updateUserInfo.weight = updateUserInfoDto.weight;
        if(updateUserInfo.weighGoal)
            updateUserInfo.weighGoal = updateUserInfoDto.weightGoal;
        if(updateUserInfo.numberOfDaysGoal)
            updateUserInfo.numberOfDaysGoal = updateUserInfoDto.numberOfDaysGoal;
        if(updateUserInfoDto.gender)
            updateUserInfo.gender = updateUserInfoDto.gender;
        if(updateUserInfo.userId)
            updateUserInfo.userId = updateUserInfoDto.userId;

        return this.userInfoRepository.update(id, updateUserInfo);
    }

    
}