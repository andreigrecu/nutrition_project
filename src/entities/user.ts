import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { CoreEntity } from './coreEntity';

@Entity()
export class User extends CoreEntity {

    @Column({ length: 25 })
    fullName: string;

    
}