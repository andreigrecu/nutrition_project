import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class UpdateUserDto {

    @ApiProperty({
      type: String,
      description: "User`s first name",
      default:''
    })
    firstName: string;
  
    @ApiProperty({
      type: String,
      description: "User`s last name",
      default:''
    })
    lastName: string;
  
    @ApiProperty({
      type: String,
      description: "User`s email",
      default:''
    })
    email: string;
    
    @ApiProperty({
      type: Boolean,
      description: "Check if this user`s first login",
      default: false
    })
    firstLogin: boolean;
}