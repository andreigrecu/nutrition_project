import { IsNumber, IsString } from 'class-validator';
import { Entity, Column } from 'typeorm';
import { CoreEntity } from './coreEntity';

@Entity()
export class UserInfo extends CoreEntity {

    @Column()
    age: number;

    @Column()
    height: number;

    @Column()
    weight: number;

    @Column()
    weighGoal: number;

    @Column()
    numberOfDaysGoal: number;

    @Column()
    @IsString()
    userId: string;

    @Column()
    @IsString()
    gender: string;
}