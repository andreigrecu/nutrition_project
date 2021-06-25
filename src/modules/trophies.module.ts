import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrophyService } from '../services/trophy.service';
import { TrophyController } from '../controllers/trophy.controller';
import { Trophy } from '../entities/trophy';
import { ResponseFactory } from '../factories/ResponseFactory';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Trophy
        ])
    ],
    providers: [
        TrophyService,
        ResponseFactory
    ],
    controllers: [
        TrophyController
    ],
})

export class TrophiesModule { }