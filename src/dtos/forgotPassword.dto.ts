import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  
  @ApiProperty({
    type: String,
    description: "The user email",
    default:''
  })
  @IsString() 
  email: string;
}