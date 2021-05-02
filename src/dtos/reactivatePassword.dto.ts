import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReactivatePasswordDto {
  @ApiProperty({
    type: String,
    description: "The token",
    default:''
  })
  @IsString() 
  token: string;

  @ApiProperty({
    type: String,
    description: "The new password",
    default:''
  })
  @IsString() 
  new_password: string;

  @ApiProperty({
    type: String,
    description: "The confirmation password",
    default:''
  })
  @IsString() 
  confirm_password: string;
}