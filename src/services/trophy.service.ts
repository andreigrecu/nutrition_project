import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Trophy } from '../entities/trophy';
import { Repository } from 'typeorm';
import { CreateTrophiesDto } from '../dtos/createTrophiesDto';

@Injectable()
export class TrophyService {

    constructor(
        @InjectRepository(Trophy) 
        private trophiesRepository: Repository<Trophy>,
    ) { }

    async findAll(
    ): Promise<Trophy[]> {
        return await this.trophiesRepository.find();
    }

    async create(
        createTrophiesDto: CreateTrophiesDto
    ): Promise<Trophy> {
        
        const trophy = new Trophy();
        if(createTrophiesDto.image)
            trophy.image = createTrophiesDto.image;
        if(createTrophiesDto.daysForAchieving)
            trophy.daysForAchieving = createTrophiesDto.daysForAchieving;
        if(createTrophiesDto.programId)
            trophy.programId = createTrophiesDto.programId;

        return await this.trophiesRepository.save(trophy);
    }

}