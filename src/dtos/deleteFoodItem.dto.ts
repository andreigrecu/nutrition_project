import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { MealType } from '../common/mealType';

export class DeleteFoodItemDto {

    @ApiProperty({
      type: String,
      description: "Food spoonacular id",
      default:''
    })
    @IsString()
    foodId: string;

    @ApiProperty({
        type: String,
        description: "The type of meal",
        default:''
    })
    @IsString()
    mealType: MealType;

    @ApiProperty({
      type: Number,
      description: "The number of servings to delete",
      default:''
    })
    nrOfServings: Number;

    @ApiProperty({
      type: Number,
      description: "The index food to be deleted",
      default:''
    })
    indexDelete: Number;
}