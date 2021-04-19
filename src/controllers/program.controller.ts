import { Controller, Post, Body, Get } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Program } from '../models/program.model';
import { ProgramService } from '../services/program.service';
import { ProgramDto } from '../dtos/program.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Programs')
@Controller('programs')
export class ProgramsController {

    constructor(
        @InjectModel('Program')
        private readonly pragramModel: Model<Program>,
        private readonly programService: ProgramService
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
            programDto.percentageType,
            programDto.imageName
        )

        return program;
    }

    @Get()
    async get(
    ): Promise<Program[]> {
        const program = await this.pragramModel.find();
        
        return program;
    }

}