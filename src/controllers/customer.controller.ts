import { Controller, Post, Body, Get, Put, Delete,Param, UseGuards, UseFilters, Res} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer } from '../models/customer.model';
import { CustomerService } from '../services/customer.service';
import { CustomerDto } from '../dtos/customer.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Customers')
@Controller('customers')
export class CustomersController {

    constructor(
        @InjectModel('Customer')
        private readonly customerModel: Model<Customer>,
        private readonly customerService: CustomerService
    ) { }

    @Post()
    async create(
        @Body() customerDto: CustomerDto,
    ): Promise<Customer> {

        const customer = await this.customerService.create(
            new Date(),
            new Date(),
            customerDto.meta_fields,
            customerDto.tags,
            customerDto.source,
            customerDto.meeting_date
        )

        return customer;
    }

    @Get()
    async get(
    ): Promise<Customer[]> {
        const customers = await this.customerModel.find();
        
        return customers;
    }

}