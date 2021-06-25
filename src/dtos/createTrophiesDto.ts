import { ApiProperty } from '@nestjs/swagger';

export class CreateTrophiesDto {
  
    @ApiProperty({
        type: String,
        description: "The trophie image",
        default: ''
    })
    image: string;

    @ApiProperty({
        type: Number,
        description: "The trophie achievement goal",
        default: 0
    })
    daysForAchieving: number;

    @ApiProperty({
        type: String,
        description: "The trophie`s programd id",
        default: ""
    })
    programId: string;

}