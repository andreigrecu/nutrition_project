import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserInfo } from '../entities/userInfo';
import { Repository } from 'typeorm';
import { CreateUserInfoDto } from '../dtos/createUserInfo.dto';
import { UpdateUserInfoDto } from '../dtos/updateUserInfo.dto';

@Injectable()
export class UserInfoService {

    constructor(
        @InjectRepository(UserInfo) 
        private userInfoRepository: Repository<UserInfo>,
    ) { }

    async create(
        createUserInfoDto: CreateUserInfoDto
    ): Promise<UserInfo> {

        let userInfo: UserInfo = new UserInfo();
        userInfo.age = createUserInfoDto.age;
        userInfo.height = createUserInfoDto.height;
        userInfo.weight = createUserInfoDto.weight;
        userInfo.weightGoal = createUserInfoDto.weightGoal;
        userInfo.numberOfDaysGoal = createUserInfoDto.numberOfDaysGoal;
        userInfo.gender = createUserInfoDto.gender;
        userInfo.userId = createUserInfoDto.userId;
        userInfo.activityType = createUserInfoDto.activityType;

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
        if(updateUserInfoDto.weight) 
            updateUserInfo.weight = updateUserInfoDto.weight;
        if(updateUserInfoDto.weightGoal)
            updateUserInfo.weightGoal = updateUserInfoDto.weightGoal;
        if(updateUserInfoDto.numberOfDaysGoal)
            updateUserInfo.numberOfDaysGoal = updateUserInfoDto.numberOfDaysGoal;
        if(updateUserInfoDto.gender)
            updateUserInfo.gender = updateUserInfoDto.gender;
        if(updateUserInfoDto.programId)
            updateUserInfo.programId = updateUserInfoDto.programId;
        if(updateUserInfoDto.carbohydratesPercent)
            updateUserInfo.carbohydratesPercent = updateUserInfoDto.carbohydratesPercent;
        if(updateUserInfoDto.fatsPercent)
            updateUserInfo.fatsPercent = updateUserInfoDto.fatsPercent;
        if(updateUserInfoDto.proteinsPercent)
            updateUserInfo.proteinsPercent = updateUserInfoDto.proteinsPercent;
        if(updateUserInfoDto.activityType)
            updateUserInfo.activityType = updateUserInfoDto.activityType;

        return this.userInfoRepository.update(id, updateUserInfo);
    }
    
}