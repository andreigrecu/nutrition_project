import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { IsString } from 'class-validator';
import { CoreEntity } from './coreEntity';
import { User } from './user';

@Entity()
export class Trophy extends CoreEntity {

    @Column({ 
        default: null
    })
    @IsString()
    title: string;

    @Column({ 
        default: null
    })
    @IsString()
    image: string;

    @Column({
        default: 0
    })
    daysForAchieving: number;

    @Column({ 
        default: null
    })
    @IsString()
    programId: string;

    @ManyToMany(() => User, user => user.trophies)
    @JoinTable()
    users: User[];
}