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

    @Column({nullable: true})
    programId: string;

    @Column({default: -1})
    carbohydratesPercent: number;

    @Column({default: -1})
    fatsPercent: number;

    @Column({default: -1})
    proteinsPercent: number;
}