import Permission from '../../entities/Permission';
import RoleReference from '../role/RoleReference';

export default class PermissionView {
    id: number;
    role: RoleReference;
    claim: number;

    constructor(data: Permission) {
        this.id = data.id;
        this.role = new RoleReference(data.role);
        this.claim = data.claim;
    }

    static parseArray(list: Permission[]): PermissionView[] {
        return list && Array.isArray(list) ? list.map(item => new PermissionView(item)) : [];
    }
};
