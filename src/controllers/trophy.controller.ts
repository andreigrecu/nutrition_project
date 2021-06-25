import { Controller, Post, Body, Get, Put, Delete, Param, Res} from '@nestjs/common';
import { TrophyService } from '../services/trophy.service';
import { Response } from 'express';
import { ResponseFactory } from '../factories/ResponseFactory';
import { CreateTrophiesDto } from '../dtos/createTrophiesDto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Trophies')
@Controller('trophies')
export class TrophyController {

    constructor(
        private trophyService: TrophyService,
        private readonly responseFactory: ResponseFactory,
    ) { }

    @Get()
    async findAll(
        @Res() response: Response
    ): Promise<any> {
       
        const trophies = await this.trophyService.findAll();

        if(!trophies)
            return this.responseFactory.notFound({ _general: 'trophies.throphies_not_found' }, response);

        return this.responseFactory.ok(trophies, response);
    }

    @Post()
    async create(
        @Body() createTrophiesDto: CreateTrophiesDto,
        @Res() response: Response
    ): Promise<any> {

        const trophy = await this.trophyService.create(createTrophiesDto);

        if(!trophy)
            return this.responseFactory.error({ _general: 'trophies.trophy_not_create' }, response);

        return this.responseFactory.ok(trophy, response);
    }
}