import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsString } from 'class-validator';

export class CreateUserDto {

    @ApiProperty({
      type: String,
      description: "User`s first name",
      default:''
    })
    @IsString()
    firstName: string;
  
    @ApiProperty({
      type: String,
      description: "User`s last name",
      default:''
    })
    @IsString()
    lastName: string;
  
    @ApiProperty({
      type: String,
      description: "User`s email",
      default:''
    })
    @IsEmail()
    email: string;
    
    @ApiProperty({
      type: String,
      description: "User`s password",
      default:''
    })
    @IsString()
    password: string;

    @ApiProperty({
      type: Date,
      description: "User`s birthday",
      default:''
    })
    @IsDateString()
    birthday: Date;

}