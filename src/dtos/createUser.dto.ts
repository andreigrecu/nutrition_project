import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {

    @ApiProperty({
      type: String,
      description: "The user full name",
      default:''
    })
    fullName: string;
  
    @ApiProperty({
      type: String,
      description: "User`s birthday",
      default:''
    })
    birthday: string;
  
    @ApiProperty({
      type: String,
      description: "Is active",
      default:''
    })
    isActive: boolean;

}