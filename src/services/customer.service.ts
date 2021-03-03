import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from 'mongoose';
import { Customer } from "../models/customer.model";

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel('Customer')
    private readonly customerModel: Model<Customer>,
  ) { }

  async create(
    createdAt: Date,
    updatedAt: Date,
    meta_fields: any,
    tags: any,
    source: string,
    meeting_date: string
  ) {
    const newCustomerAction = new this.customerModel({
      createdAt,
      updatedAt,
      meta_fields,
      tags,
      source,
      meeting_date
    });
    return await newCustomerAction.save();
  }

}