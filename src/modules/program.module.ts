import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MongooseModule } from '@nestjs/mongoose';
import { ProgramSchema } from "../models/program.model";
import { ProgramsController } from "../controllers/program.controller";
import { ProgramService } from "../services/program.service";

@Module({
    imports:[
        TypeOrmModule.forFeature([]),    
        MongooseModule.forFeature(
            [
              { name: 'Program', schema: ProgramSchema },
            ]
          ),    
    ],
    exports: [TypeOrmModule],
    providers: [
        ProgramService    
    ],
    controllers: [
      ProgramsController
    ]
})
export class ProgramModule {}