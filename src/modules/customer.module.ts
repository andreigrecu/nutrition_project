import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerSchema } from "../models/customer.model";
import { CustomersController } from "../controllers/customer.controller";
import { CustomerService } from "../services/customer.service";

@Module({
    imports:[
        TypeOrmModule.forFeature([]),    
        MongooseModule.forFeature(
            [
              { name: 'Customer', schema: CustomerSchema },
            ]
          ),    
    ],
    exports: [TypeOrmModule],
    providers: [
        CustomerService    
    ],
    controllers: [
      CustomersController
    ]
})
export class CustomerModule {}