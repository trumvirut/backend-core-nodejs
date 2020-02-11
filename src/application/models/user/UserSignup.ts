import { IsEmail, IsLowercase, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export default class UserSignup {
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
};
