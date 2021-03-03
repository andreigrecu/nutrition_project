import * as mongoose from 'mongoose';

export const CustomerSchema = new mongoose.Schema({
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
  meta_fields: {},
  tags: [],
  source: { type: String },
  meeting_date: { type: String }
});

export interface Customer extends mongoose.Document {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  meta_fields: any,
  tags: any,
  source: string,
  meeting_date: string
}