import { Optional } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UserQueryParams {
    @ApiPropertyOptional()
    @Optional()
    readonly email?: string;

    @ApiPropertyOptional()
    @Optional()
    readonly firstName?: string;

    @ApiPropertyOptional()
    @Optional()
    readonly lastName?: string;

    @ApiPropertyOptional()
    @Optional()
    readonly id?: string;

    @ApiPropertyOptional()
    @Optional()
    readonly createdAt?: Date;
}

