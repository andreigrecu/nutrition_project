import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class AuthDto {

    @ApiProperty({
      type: String,
      description: "User`s login email",
      default:''
    })
    @IsEmail()
    readonly email: string;

    @ApiProperty({
        type: String,
        description: "User`s login password",
        default: ''
    })
    @IsString()
    readonly password: String;

}