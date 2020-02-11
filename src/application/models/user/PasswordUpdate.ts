import { IsString, Length } from 'class-validator';

export default class PasswordUpdate {
    @IsString()
    @Length(6, 20)
    password: string;

    @IsString()
    @Length(6, 20)
    newPassword: string;
};
