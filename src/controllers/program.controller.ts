import { Controller, Post, Body, Get, Param, Res } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Program } from '../models/program.model';
import { ProgramService } from '../services/program.service';
import { ProgramDto } from '../dtos/program.dto';
import { ApiTags } from '@nestjs/swagger';
import { ResponseFactory } from '../factories/ResponseFactory';
import { Response } from 'express';

@ApiTags('Programs')
@Controller('programs')
export class ProgramsController {

    constructor(
        @InjectModel('Program')
        private readonly programModel: Model<Program>,
        private readonly programService: ProgramService,
        private readonly responseFactory: ResponseFactory
    ) { }

    @Post()
    async create(
        @Body() programDto: ProgramDto,
    ): Promise<Program> {

        const program = await this.programService.create(
            new Date(),
            new Date(),
            programDto.name,
            programDto.description,
            programDto.caloriesAdjustment,
            programDto.imageName,
            programDto.carbosPercent,
            programDto.fatsPercent,
            programDto.proteinsPercent,
            programDto.weeklyKgs
        )

        return program;
    }

    @Get()
    async get(
    ): Promise<Program[]> {
        const programs = await this.programModel.find();
        
        return programs;
    }

    @Get(':id')
    async getProgram(
        @Param('id') id: string,
        @Res() response: Response
    ): Promise<any> {

        const program = await this.programModel.findOne({
            _id: id
        });
        
        if(!program)
            return this.responseFactory.notFound({ _general: 'programs.program_not_found' }, response);

        return this.responseFactory.ok(program, response);
    }

}