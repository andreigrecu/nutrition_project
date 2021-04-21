import { IsEmail, IsString } from 'class-validator';
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
    weightGoal: number;

    @Column()
    numberOfDaysGoal: number;

    @Column({nullable: true})
    gender: string;

    @Column({nullable: true})
    userId: string;
}