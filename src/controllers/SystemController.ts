import { Inject } from 'typedi';
import { Body, JsonController, Post } from 'routing-controllers';
import IUserBusiness from '../application/businesses/interfaces/IUserBusiness';
import UserBusiness from '../application/businesses/UserBusiness';
import PermissionBusiness from '../application/businesses/PermissionBusiness';
import IPermissionBusiness from '../application/businesses/interfaces/IPermissionBusiness';
import RoleBusiness from '../application/businesses/RoleBusiness';
import IRoleBusiness from '../application/businesses/interfaces/IRoleBusiness';
import getRoles from '../resources/data/initialization/Role';
import getPermissions from '../resources/data/initialization/Permission';
import getUsers from '../resources/data/initialization/User';

@JsonController('/systems')
export default class SystemController {
    @Inject(() => UserBusiness)
    private userBusiness: IUserBusiness;

    @Inject(() => RoleBusiness)
    private roleBusiness: IRoleBusiness;

    @Inject(() => PermissionBusiness)
    private permissionBusiness: IPermissionBusiness;

    @Post('/init-data')
    // @Authorized(SystemClaim.INIT_DATA)
    async initData(@Body() isRequired: boolean) {
        const initRoles = getRoles();
        await this.roleBusiness.initialRoles(initRoles, isRequired);

        const initUsers = getUsers();
        await this.userBusiness.initialUsers(initUsers, isRequired);

        const initPermissions = getPermissions();
        await this.permissionBusiness.initialPermissions(initPermissions, isRequired);

        return true;
    }
};
