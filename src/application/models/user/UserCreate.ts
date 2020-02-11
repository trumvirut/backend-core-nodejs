import { IsEmail, IsInt, IsLowercase, IsOptional, IsString, Length, MaxLength, Min } from 'class-validator';
import { IsDateAndParse } from '../../../system/CustomDecorator';
import { Gender } from '../common/Enum';

export default class UserCreate {
    @IsInt()
    @Min(1)
    roleId: number;

    @IsString()
    @MaxLength(20)
    firstName: string;

    @IsString()
    @IsOptional()
    @MaxLength(20)
    lastName?: string;

    @IsEmail()
    @IsLowercase()
    @MaxLength(200)
    email: string;

    @IsString()
    @Length(6, 20)
    password: string;

    @IsInt()
    @IsOptional()
    // @IsIn(Object.values(Gender).filter(value => !isNaN(value)))
    gender?: Gender;

    @IsDateAndParse()
    @IsOptional()
    birthday?: Date;

    @IsString()
    @IsOptional()
    @MaxLength(20)
    phone?: string;

    @IsString()
    @IsOptional()
    @MaxLength(200)
    address?: string;

    @IsString()
    @IsOptional()
    @MaxLength(5)
    culture?: string;

    @IsString()
    @IsOptional()
    @Length(3, 3)
    currency?: string;
};
