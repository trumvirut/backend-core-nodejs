import { Inject } from 'typedi';
import { Authorized, Body, Delete, Get, JsonController, Param, Post, Put, QueryParam } from 'routing-controllers';
import RoleBusiness from '../application/businesses/RoleBusiness';
import IRoleBusiness from '../application/businesses/interfaces/IRoleBusiness';
import RoleClaim from '../resources/permissions/RoleClaim';
import RoleCreate from '../application/models/role/RoleCreate';
import RoleUpdate from '../application/models/role/RoleUpdate';

@JsonController('/roles')
export default class RoleController {
    @Inject(() => RoleBusiness)
    private roleBusiness: IRoleBusiness;

    @Get('/')
    @Authorized(RoleClaim.GET)
    findRoles(@QueryParam('keyword') keyword: string, @QueryParam('skip') skip: number, @QueryParam('limit') limit: number) {
        return this.roleBusiness.findRoles(keyword, skip, limit);
    }

    @Get('/lookup')
    @Authorized(RoleClaim.GET)
    lookupRoles(@QueryParam('keyword') keyword: string, @QueryParam('skip') skip: number, @QueryParam('limit') limit: number) {
        return this.roleBusiness.lookupRoles(keyword, skip, limit);
    }

    @Get('/:id([0-9]+)')
    @Authorized(RoleClaim.GET)
    getRole(@Param('id') id: number) {
        return this.roleBusiness.getRole(id);
    }

    @Get('/role-by-code')
    @Authorized(RoleClaim.GET)
    getRoleByCode(@QueryParam('code') code: number) {
        return this.roleBusiness.getRoleByCode(code);
    }

    @Post('/')
    @Authorized(RoleClaim.CREATE)
    createRole(@Body() data: RoleCreate) {
        return this.roleBusiness.createRole(data);
    }

    @Put('/:id([0-9]+)')
    @Authorized(RoleClaim.UPDATE)
    updateRole(@Param('id') id: number, @Body() data: RoleUpdate) {
        return this.roleBusiness.updateRole(id, data);
    }

    @Delete('/:id([0-9]+)')
    @Authorized(RoleClaim.DELETE)
    deleteRole(@Param('id') id: number) {
        return this.roleBusiness.deleteRole(id);
    }
};
