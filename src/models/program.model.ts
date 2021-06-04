import * as mongoose from 'mongoose';

export const ProgramSchema = new mongoose.Schema({
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
  name: { type: String, required: true },
  description: { type: String, required: false },
  percentageType: { type: Number, required: true },
  imageName: { type: String, required: true },
  carbosPercent: { type: Number, required: true },
  fatsPercent: { type: Number, required: true },
  proteinsPercent: { type: Number, required: true }
});

export interface Program extends mongoose.Document {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description: string;
  percentageType: number;
  imageName: string;
  carbosPerent: number;
  fatsPercent: number;
  proteinsPercent: number;
}