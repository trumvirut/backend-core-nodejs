import Role from '../../entities/Role';

export default class RoleLookup {
    id: number;
    code: number;
    name: string;
    level: number;

    constructor(data: Role) {
        this.id = data.id;
        this.code = data.code;
        this.name = data.name;
        this.level = data.level;
    }

    static parseArray(list: Role[]): RoleLookup[] {
        return list && Array.isArray(list) ? list.map(item => new RoleLookup(item)) : [];
    }
};
