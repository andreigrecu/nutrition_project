import { ApiProperty } from '@nestjs/swagger';

export class UpdateWorkoutDto {
  
  @ApiProperty({
    type: Number,
    description: "The workout burned calories",
    default:''
  })
  readonly workoutVal: number;

}