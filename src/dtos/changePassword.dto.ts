import { IsString  } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    type: String,
    description: "Current Password",
    default:''
  })
  @IsString() 
  current_password: string;

  @ApiProperty({
    type: String,
    description: "New password",
    default:''
  })
  @IsString() 
  new_password: string;

  @ApiProperty({
    type: String,
    description: "Confirm password",
    default:''
  })
  @IsString() 
  confirm_password: string;

}