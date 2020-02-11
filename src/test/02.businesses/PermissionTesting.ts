import 'mocha';
import * as path from 'path';
import { expect } from 'chai';
import { Container } from 'typedi';
import DataAccess from '../../application/dataAccess';
import IRoleBusiness from '../../application/businesses/interfaces/IRoleBusiness';
import RoleBusiness from '../../application/businesses/RoleBusiness';
import IPermissionBusiness from '../../application/businesses/interfaces/IPermissionBusiness';
import PermissionBusiness from '../../application/businesses/PermissionBusiness';
import Permission from '../../application/entities/Permission';
import RoleClaim from '../../resources/permissions/RoleClaim';
import PermissionCreate from '../../application/models/permission/PermissionCreate';
import getRoles from '../../resources/data/initialization/Role';
import getPermissions from '../../resources/data/initialization/Permission';
import FileHelper from '../../helpers/FileHelper';

let roleBusiness: IRoleBusiness;
let permissionBusiness: IPermissionBusiness;
let roleId: number;

const generatePermissionData = () => {
    const permissionCreate = new PermissionCreate();
    permissionCreate.roleId = roleId;
    permissionCreate.claim = RoleClaim.CREATE;

    return permissionCreate;
};

describe('Permission testing', () => {
    before(async () => {
        await DataAccess.connection.synchronize(true);
        if (DataAccess.connection.queryResultCache)
            await DataAccess.connection.queryResultCache.clear();

        roleBusiness = Container.get(RoleBusiness);
        permissionBusiness = Container.get(PermissionBusiness);

        await roleBusiness.initialRoles(getRoles(), true);

        const data = await roleBusiness.findRoles('', 1, 1);
        if (data.results.length)
            roleId = data.results[0].id;
    });

    beforeEach(async () => {
        if (DataAccess.connection.queryResultCache)
            await DataAccess.connection.queryResultCache.clear();

        await DataAccess.connection.createQueryBuilder().delete().from(Permission).execute();
    });

    after(async () => {
        await DataAccess.connection.synchronize(true);
        if (DataAccess.connection.queryResultCache)
            await DataAccess.connection.queryResultCache.clear();
    });

    it('Get claim permissions', async () => {
        const claimPermissions = await permissionBusiness.getClaimPermissions();
        const files = await FileHelper.getFiles(path.join(__dirname, '../../resources/permissions'));
        expect(claimPermissions && claimPermissions.length).to.eq(files.filter(file => !file.endsWith('.map')).length);
    });

    it('Get permission without id', async () => {
        await permissionBusiness.getPermission(undefined as any).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Get permission with id invalid', async () => {
        await permissionBusiness.getPermission('1' as any).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Get permissions by role without param', async () => {
        await permissionBusiness.getPermissionsByRole(undefined as any).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Get permissions by role invalid', async () => {
        await permissionBusiness.getPermissionsByRole('1' as any).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Get permissions by role', async () => {
        const permissionCreate = generatePermissionData();
        const permission = await permissionBusiness.createPermission(permissionCreate);

        if (permission) {
            const permissions = await permissionBusiness.getPermissionsByRole(permissionCreate.roleId);
            expect(Array.isArray(permissions) && permissions.length > 0).to.eq(true);
        }
    });

    it('Check permission with params invalid', async () => {
        await permissionBusiness.checkPermission(undefined as any, undefined as any).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Check permission already existed', async () => {
        const permissionCreate = generatePermissionData();
        const permission = await permissionBusiness.createPermission(permissionCreate);

        if (permission) {
            const result = await permissionBusiness.checkPermission(permissionCreate.roleId, [permissionCreate.claim]);
            expect(result).to.eq(true);
        }
    });

    it('Check permission is not exists', async () => {
        const permissionCreate = generatePermissionData();
        const permission = await permissionBusiness.createPermission(permissionCreate);

        if (permission) {
            const result = await permissionBusiness.checkPermission(permissionCreate.roleId, [permissionCreate.claim * 100]);
            expect(result).to.eq(false);
        }
    });

    it('Create new permission with data invalid', async () => {
        await permissionBusiness.createPermission(undefined as any).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Create new permission without role', async () => {
        const permissionCreate = generatePermissionData();
        permissionCreate.roleId = undefined as any;

        await permissionBusiness.createPermission(permissionCreate).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Create new permission without claim', async () => {
        const permissionCreate = generatePermissionData();
        permissionCreate.claim = undefined as any;

        await permissionBusiness.createPermission(permissionCreate).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Create new permission with claim invalid', async () => {
        const permissionCreate = generatePermissionData();
        permissionCreate.claim = '1000' as any;

        await permissionBusiness.createPermission(permissionCreate).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Create new permission with duplication', async () => {
        const permissionCreate = generatePermissionData();
        const permission = await permissionBusiness.createPermission(permissionCreate);

        if (permission) {
            await permissionBusiness.createPermission(permissionCreate).catch(error => {
                expect(error.httpCode).to.eq(400);
            });
        }
    });

    it('Create new permission successfully', async () => {
        const permissionCreate = generatePermissionData();
        const permission = await permissionBusiness.createPermission(permissionCreate);
        expect(!!permission).to.eq(true);
    });

    it('Delete permission without id', async () => {
        await permissionBusiness.deletePermission(undefined as any).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Delete permission with id invalid', async () => {
        await permissionBusiness.deletePermission('1' as any).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Delete permission with id not exists', async () => {
        await permissionBusiness.deletePermission(1000000).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Delete permission successfully', async () => {
        const permissionCreate = generatePermissionData();
        const permission = await permissionBusiness.createPermission(permissionCreate);

        if (permission) {
            const result = await permissionBusiness.deletePermission(permission.id);
            expect(result).to.eq(true);
        }
    });

    it('Initial permissions with data input invalid', async () => {
        await permissionBusiness.initialPermissions(undefined as any, true).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Initial permissions successfull', async () => {
        const initPermissions = getPermissions();
        const result = await permissionBusiness.initialPermissions(initPermissions, true);
        expect(result).to.eq(true);
    });
});
