import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from 'mongoose';
import { Program } from "../models/program.model";

@Injectable()
export class ProgramService {
  constructor(
    @InjectModel('Program')
    private readonly programModel: Model<Program>,
  ) { }

  async create(
    createdAt: Date,
    updatedAt: Date,
    name: String,
    description: String,
    caloriesAdjustment: Number,
    imageName: String,
    carbosPercent: number,
    fatsPercent: number,
    proteinsPercent: number,
    weeklyKgs: number
  ) {
        const newProgramAction = new this.programModel({
            createdAt,
            updatedAt,
            name,
            description,
            caloriesAdjustment,
            imageName,
            carbosPercent,
            fatsPercent,
            proteinsPercent,
            weeklyKgs
        });

        return await newProgramAction.save();
  }

}