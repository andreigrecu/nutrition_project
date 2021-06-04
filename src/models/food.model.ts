import * as mongoose from 'mongoose';

export const FoodSchema = new mongoose.Schema({
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
    userId: { type: String, required: true},
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
    programId: { type: String },
    caloriesGoal: { type: Number, required: true },
    carbosGoal: { type: Number, required: true },
    fatsGoal: { type: Number, required: true },
    proteinsGoal: { type: Number, required: true },
    workout: { type: Number, required: true }
})

export interface Food extends mongoose.Document {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    breakfast: any;
    lunch: any;
    dinner: any;
    snacks: any;
    programId: string;
    caloriesGoal: number;
    carbosGoal: number;
    fastsGoal: number;
    proteinsGoal: number;
    workout: number;
}