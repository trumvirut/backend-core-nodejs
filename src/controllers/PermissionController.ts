import { Inject } from 'typedi';
import { Authorized, Body, Delete, Get, JsonController, Param, Post, QueryParam } from 'routing-controllers';
import PermissionBusiness from '../application/businesses/PermissionBusiness';
import IPermissionBusiness from '../application/businesses/interfaces/IPermissionBusiness';
import PermissionClaim from '../resources/permissions/PermissionClaim';
import PermissionCreate from '../application/models/permission/PermissionCreate';

@JsonController('/permissions')
export default class RoleController {
    @Inject(() => PermissionBusiness)
    private permissionBusiness: IPermissionBusiness;

    @Get('/:id([0-9]+)')
    @Authorized(PermissionClaim.GET)
    getPermission(@Param('id') id: number) {
        return this.permissionBusiness.getPermission(id);
    }

    @Get('/permission-by-role')
    @Authorized(PermissionClaim.GET)
    getPermissionsByRole(@QueryParam('roleId') roleId: number) {
        return this.permissionBusiness.getPermissionsByRole(roleId);
    }

    @Post('/')
    @Authorized(PermissionClaim.CREATE)
    createPermission(@Body() data: PermissionCreate) {
        return this.permissionBusiness.createPermission(data);
    }

    @Delete('/:id([0-9]+)')
    @Authorized(PermissionClaim.DELETE)
    deletePermission(@Param('id') id: number) {
        return this.permissionBusiness.deletePermission(id);
    }
};
