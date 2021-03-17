import { IsDate, IsEmail, IsString, minLength } from 'class-validator';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { CoreEntity } from './coreEntity';

@Entity()
export class User extends CoreEntity {

    @Column({ length: 25 })
    @IsString()
    firstName: string;

    @Column({ length: 35})
    @IsString()
    lastName: string;

    @Column({ unique: true, length: 255 })
    @IsEmail()
    email: string;

    @Column({ length: 255 })
    @IsString()
    password: string;

    @Column({ nullable: true })
    @IsDate()
    birthday: Date;
}