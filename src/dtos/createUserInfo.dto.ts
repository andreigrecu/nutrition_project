import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsSemVer, IsString } from 'class-validator';

export class CreateUserInfoDto {

    @ApiProperty({
      type: Number,
      description: "User`s age",
      default:''
    })
    age: number;
  
    @ApiProperty({
      type: Number,
      description: "User`s height",
      default:''
    })
    height: number;
  
    @ApiProperty({
      type: Number,
      description: "User`s weight",
      default:''
    })
    weight: number;
    
    @ApiProperty({
      type: Number,
      description: "User`s weight goal",
      default:''
    })
    weightGoal: number;

    @ApiProperty({
      type: Number,
      description: "User`s number of days goal",
      default:''
    })
    numberOfDaysGoal: number;

    @ApiProperty({
      type: String,
      description: "User`s id from user table",
      default:''
    })
    @IsString()
    userId: string;

    @ApiProperty({
      type: String,
      description: "User`s gender",
      default:''
    })
    gender: string;
}