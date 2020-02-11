import { IsInt, Min } from 'class-validator';

export default class PermissionCreate {
    @IsInt()
    @Min(1)
    roleId: number;

    @IsInt()
    @Min(1)
    claim: number;
};
