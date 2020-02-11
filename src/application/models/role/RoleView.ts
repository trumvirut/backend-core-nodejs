import Role from '../../entities/Role';

export default class RoleView {
    id: number;
    code: number;
    name: string;
    level: number;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: Role) {
        this.id = data.id;
        this.code = data.code;
        this.name = data.name;
        this.level = data.level;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    static parseArray(list: Role[]): RoleView[] {
        return list && Array.isArray(list) ? list.map(item => new RoleView(item)) : [];
    }
};
