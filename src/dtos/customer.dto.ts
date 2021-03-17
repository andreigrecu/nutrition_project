import { IsString, IsEmail  } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Any } from 'typeorm';

export class CustomerDto {
  
  @ApiProperty({
    type: Any,
    description: "The meta fields",
    default:''
  })
  readonly meta_fields: any;

  @ApiProperty({
    type: Any,
    description: "tags",
    default:''
  })
  readonly tags: any;

  @ApiProperty({
    type: Any,
    description: "The source",
    default:''
  })
  readonly source: string;

  @ApiProperty({
    type: Any,
    description: "The meeting_date",
    default:''
  })
  readonly meeting_date: string;

}