import Role from '../../entities/Role';

export default class RoleReference {
    id: number;
    code: number;
    name: string;

    constructor(data: Role) {
        this.id = data.id;
        this.code = data.code;
        this.name = data.name;
    }
};
