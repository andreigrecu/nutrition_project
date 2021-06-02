import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from 'mongoose';
import { Food } from "../models/food.model";

@Injectable()
export class FoodService {
  constructor(
    @InjectModel('Food')
    private readonly foodModel: Model<Food>,
  ) { }

  async create(
    createdAt: Date,
    updatedAt: Date,
    userId: string,
    breakfast: any,
    lunch: any,
    dinner: any,
    snacks: any,
    programId: string,
    caloriesGoal: number,
    carbosGoal: number,
    fatsGoal: number,
    proteinsGoal: number
  ) {
      const newFoodAction = new this.foodModel({
        createdAt,
        updatedAt,
        userId,
        breakfast,
        lunch,
        dinner,
        snacks,
        programId,
        caloriesGoal,
        carbosGoal,
        fatsGoal,
        proteinsGoal
      });
      
      return await newFoodAction.save();
  }

}
 