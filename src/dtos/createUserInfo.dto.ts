import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateUserInfoDto {

    @ApiProperty({
      type: Number,
      description: "User`s age"
    })
    @IsNumber()
    age: number;
  
    @ApiProperty({
      type: Number,
      description: "User`s height"
    })
    @IsNumber()
    height: number;
    
    @ApiProperty({
      type: Number,
      description: "User`s weight"
    })
    @IsNumber()
    weight: number;

    @ApiProperty({
      type: Number,
      description: "User`s weight goal"
    })
    @IsNumber()
    weightGoal: number;

    @ApiProperty({
      type: Number,
      description: 'User`s number of days goal'
    })
    @IsNumber()
    numberOfDaysGoal: number;

    @ApiProperty({
        type: String,
        description: 'User`s gender',
        default: ''
    })
    @IsString()
    gender: string;

    @ApiProperty({
      type: String,
      description: 'User`s id',
      default: ''
    })
    @IsString()
    userId: string;

}