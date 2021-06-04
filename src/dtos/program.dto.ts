import { ApiProperty } from '@nestjs/swagger';

export class ProgramDto {
  
  @ApiProperty({
    type: String,
    description: "The name of the program",
    default:''
  })
  readonly name: String;

  @ApiProperty({
    type: String,
    description: "The description of the program",
    default:''
  })
  readonly description: String;

  @ApiProperty({
    type: Number,
    description: "The percentageType of the program",
    default:''
  })
  readonly percentageType: Number;

  @ApiProperty({
    type: String,
    description: "The program`s image name",
    default:''
  })
  readonly imageName: String;

  @ApiProperty({
    type: Number,
    description: "The carbos percentage",
    default:''
  })
  readonly carbosPercent: number;

  @ApiProperty({
    type: Number,
    description: "The fats percentage",
    default:''
  })
  readonly fatsPercent: number;

  @ApiProperty({
    type: Number,
    description: "The proteins percentage",
    default:''
  })
  readonly proteinsPercent: number;

}