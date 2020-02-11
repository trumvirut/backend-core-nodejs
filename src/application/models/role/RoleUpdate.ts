import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export default class RoleUpdate {
    @IsString()
    @IsOptional()
    @MaxLength(50)
    name: string;

    @IsInt()
    @IsOptional()
    @Min(1)
    @Max(100)
    level: number;
};
