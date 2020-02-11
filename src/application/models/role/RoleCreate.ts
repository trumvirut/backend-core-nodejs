import { IsInt, IsString, Max, MaxLength, Min } from 'class-validator';
import { RoleCode } from '../common/Enum';

export default class RoleCreate {
    @IsInt()
    // @IsIn(Object.values(RoleCode).filter(value => !isNaN(value)))
    code: RoleCode;

    @IsString()
    @MaxLength(50)
    name: string;

    @IsInt()
    @Min(1)
    @Max(100)
    level: number;
};
