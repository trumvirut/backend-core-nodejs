import RoleView from '../../models/role/RoleView';
import RoleLookup from '../../models/role/RoleLookup';
import RoleCreate from '../../models/role/RoleCreate';
import RoleUpdate from '../../models/role/RoleUpdate';
import ResultList from '../../models/common/ResultList';

interface IRoleBusiness {
    /**
     * Find roles with pagination.
     * @param keyword role name
     */
    findRoles(keyword?: string, skip?: number, limit?: number): Promise<ResultList<RoleView>>;

    /**
     * Find roles with pagination and limited number of fields.
     * @param keyword role name
     */
    lookupRoles(keyword?: string, skip?: number, limit?: number): Promise<ResultList<RoleLookup>>;

    getRole(id: number): Promise<RoleView | undefined>;

    getRoleByCode(code: number): Promise<RoleView | undefined>;

    createRole(data: RoleCreate): Promise<RoleView | undefined>;

    updateRole(id: number, data: RoleUpdate): Promise<boolean>;

    deleteRole(id: number): Promise<boolean>;

    initialRoles(data: {isRequired?: boolean, data: any}[], isRequired?: boolean): Promise<boolean>;
}

export default IRoleBusiness;
