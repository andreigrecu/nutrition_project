import { ApiProperty } from '@nestjs/swagger';
import { Any } from 'typeorm';

export class CreateFoodDto {
  
  @ApiProperty({
    type: String,
    description: "The user id",
    default:''
  })
  readonly userId: string;

  @ApiProperty({
    type: Any,
    description: "Breakfast menu",
    default: []
  })
  readonly breakfast: any;

  @ApiProperty({
    type: Any,
    description: "Lunch menu",
    default: []
  })
  readonly lunch: any;

  @ApiProperty({
    type: Any,
    description: "Dinner menu",
    default: []
  })
  readonly dinner: any;

  @ApiProperty({
    type: Any,
    description: "Snacks",
    default: []
  })
  readonly snacks: any;

}