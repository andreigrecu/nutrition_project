import * as mongoose from 'mongoose';

export const FoodSchema = new mongoose.Schema({
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
    userId: { type: String, required: true},
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
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
}