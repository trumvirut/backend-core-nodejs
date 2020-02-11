import ClaimView from '../../models/permission/ClaimView';
import PermissionView from '../../models/permission/PermissionView';
import PermissionCreate from '../../models/permission/PermissionCreate';

interface IPermissionBusiness {
    /**
     * Get claim permissions, can be used for frontend.
     */
    getClaimPermissions(): Promise<ClaimView[]>;

    getPermission(id: number): Promise<PermissionView | undefined>;

    getPermissionsByRole(roleId: number): Promise<PermissionView[]>;

    checkPermission(roleId: number, claims: number[]): Promise<boolean>;

    createPermission(data: PermissionCreate): Promise<PermissionView | undefined>;

    deletePermission(id: number): Promise<boolean>;

    initialPermissions(data: {isRequired?: boolean, data: any}[], isRequired?: boolean): Promise<boolean>;
}

export default IPermissionBusiness;
