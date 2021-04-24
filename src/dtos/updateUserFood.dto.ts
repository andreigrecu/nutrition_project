import { ApiProperty } from '@nestjs/swagger';
import { Any } from 'typeorm';

export class UpdateUserFoodDto {

  @ApiProperty({
    type: Any,
    description: "Breakfast menu item",
    default: ''
  })
  readonly breakfastItem: any;

  @ApiProperty({
    type: Any,
    description: "Lunch menu item",
    default: ''
  })
  readonly lunchItem: any;

  @ApiProperty({
    type: Any,
    description: "Dinner menu item",
    default: ''
  })
  readonly dinnerItem: any;

  @ApiProperty({
    type: Any,
    description: "Snack item",
    default: ''
  })
  readonly snackItem: any;

}