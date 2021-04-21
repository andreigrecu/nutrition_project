import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class UpdateUserInfoDto {

    @ApiProperty({
      type: Number,
      description: "User`s age"
    })
    age: number;
  
    @ApiProperty({
      type: Number,
      description: "User`s height"
    })
    height: number;
    
    @ApiProperty({
      type: Number,
      description: "User`s weight"
    })
    weight: number;

    @ApiProperty({
      type: Number,
      description: "User`s weight goal"
    })
    weightGoal: number;

    @ApiProperty({
      type: Number,
      description: 'User`s number of days goal'
    })
    numberOfDaysGoal: number;

    @ApiProperty({
        type: String,
        description: 'User`s gender',
        default: ''
    })
    gender: string;

    @ApiProperty({
        type: String,
        description: 'User`s id',
        default: ''
    })
    @IsString()
    userId: string;
}