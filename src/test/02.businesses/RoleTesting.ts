import 'mocha';
import { expect } from 'chai';
import { Container } from 'typedi';
import DataAccess from '../../application/dataAccess';
import IRoleBusiness from '../../application/businesses/interfaces/IRoleBusiness';
import RoleBusiness from '../../application/businesses/RoleBusiness';
import Role from '../../application/entities/Role';
import RoleCreate from '../../application/models/role/RoleCreate';
import RoleUpdate from '../../application/models/role/RoleUpdate';
import { RoleCode } from '../../application/models/common/Enum';
import getRoles from '../../resources/data/initialization/Role';

let roleBusiness: IRoleBusiness;

const generateRoleData = () => {
    const roleCreate = new RoleCreate();
    roleCreate.code = RoleCode.UserCommon;
    roleCreate.name = 'Role test';
    roleCreate.level = 10;

    return roleCreate;
};

describe('Role testing', () => {
    before(async () => {
        await DataAccess.connection.synchronize(true);
        roleBusiness = Container.get(RoleBusiness);
    });

    beforeEach(async () => {
        await DataAccess.connection.createQueryBuilder().delete().from(Role).execute();
    });

    after(async () => {
        await DataAccess.connection.synchronize(true);
    });

    it('Find roles without param', async () => {
        const roleCreate = generateRoleData();
        const role = await roleBusiness.createRole(roleCreate);

        if (role) {
            const { results, pagination } = await roleBusiness.findRoles('', 0, 1);
            expect(Array.isArray(results) && results.length > 0 && pagination && pagination.total > 0).to.eq(true);
        }
    });

    it('Find roles with name', async () => {
        const roleCreate = generateRoleData();
        const role = await roleBusiness.createRole(roleCreate);

        if (role) {
            const { results, pagination } = await roleBusiness.findRoles('role', 0, 1);
            expect(Array.isArray(results) && results.length > 0 && pagination && pagination.total > 0).to.eq(true);
        }
    });

    it('Lookup roles without param', async () => {
        const roleCreate = generateRoleData();
        const role = await roleBusiness.createRole(roleCreate);

        if (role) {
            const { results, pagination } = await roleBusiness.lookupRoles('', 0, 1);
            expect(Array.isArray(results) && results.length > 0 && pagination && pagination.total > 0).to.eq(true);
        }
    });

    it('Lookup roles with name', async () => {
        const roleCreate = generateRoleData();
        const role = await roleBusiness.createRole(roleCreate);

        if (role) {
            const { results, pagination } = await roleBusiness.lookupRoles('role', 0, 1);
            expect(Array.isArray(results) && results.length > 0 && pagination && pagination.total > 0).to.eq(true);
        }
    });

    it('Get role by id without param', async () => {
        await roleBusiness.getRole(undefined as any).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Get role by id invalid', async () => {
        await roleBusiness.getRole('1' as any).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Get role by id', async () => {
        const roleCreate = generateRoleData();
        const role = await roleBusiness.createRole(roleCreate);

        if (role) {
            const result = await roleBusiness.getRole(role.id);
            expect(result && result.id === role.id).to.eq(true);
        }
    });

    it('Get role by code without param', async () => {
        await roleBusiness.getRoleByCode(undefined as any).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Get role by code invalid', async () => {
        await roleBusiness.getRoleByCode('1' as any).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Get role by code', async () => {
        const roleCreate = generateRoleData();
        const role = await roleBusiness.createRole(roleCreate);

        if (role) {
            const result = await roleBusiness.getRoleByCode(role.code);
            expect(result && result.code === role.code).to.eq(true);
        }
    });

    it('Create new role with data invalid', async () => {
        await roleBusiness.createRole(undefined as any).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Create new role without code', async () => {
        const roleCreate = generateRoleData();
        roleCreate.code = undefined as any;

        await roleBusiness.createRole(roleCreate).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Create new role with code invalid', async () => {
        const roleCreate = generateRoleData();
        roleCreate.code = 10;

        await roleBusiness.createRole(roleCreate).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Create new role without name', async () => {
        const roleCreate = generateRoleData();
        roleCreate.name = undefined as any;

        await roleBusiness.createRole(roleCreate).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Create new role with length name greater than 50 characters', async () => {
        const roleCreate = generateRoleData();
        roleCreate.name = 'This is the name with length greater than 50 characters!';

        await roleBusiness.createRole(roleCreate).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Create new role without level', async () => {
        const roleCreate = generateRoleData();
        roleCreate.level = undefined as any;

        await roleBusiness.createRole(roleCreate).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Create new role with level invalid', async () => {
        const roleCreate = generateRoleData();
        roleCreate.level = '1' as any;

        await roleBusiness.createRole(roleCreate).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Create new role with code has exists', async () => {
        const roleCreate = generateRoleData();
        await roleBusiness.createRole(roleCreate);

        await roleBusiness.createRole(roleCreate).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Create new role with name has exists', async () => {
        const roleCreate = generateRoleData();
        await roleBusiness.createRole(roleCreate);
        roleCreate.code = 100;

        await roleBusiness.createRole(roleCreate).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Create new role successfully', async () => {
        const roleCreate = generateRoleData();
        const role = await roleBusiness.createRole(roleCreate);
        expect(!!role).to.eq(true);
    });

    it('Update role with data invalid', async () => {
        const roleCreate = generateRoleData();
        const role = await roleBusiness.createRole(roleCreate);

        if (role) {
            await roleBusiness.updateRole(role.id, undefined as any).catch(error => {
                expect(error.httpCode).to.eq(400);
            });
        }
    });

    it('Update role without id', async () => {
        await roleBusiness.updateRole(undefined as any, undefined as any).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Update role with id invalid', async () => {
        await roleBusiness.updateRole('1' as any, undefined as any).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Update role with id not exists', async () => {
        const roleUpdate = new RoleUpdate();
        roleUpdate.name = 'Role test';
        roleUpdate.level = 10;

        await roleBusiness.updateRole(1000, roleUpdate).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Update role without name', async () => {
        const roleUpdate = new RoleUpdate();
        roleUpdate.name = '';
        roleUpdate.level = 100;

        await roleBusiness.updateRole(1, roleUpdate).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Update role with length name greater than 50 characters', async () => {
        const roleUpdate = new RoleUpdate();
        roleUpdate.name = 'This is the name with length greater than 50 characters!';
        roleUpdate.level = 100;

        await roleBusiness.updateRole(1, roleUpdate).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Update role with name has exists', async () => {
        const roleCreate = generateRoleData();
        const role = await roleBusiness.createRole(roleCreate);

        if (role) {
            const roleCreate2 = generateRoleData();
            roleCreate2.code = RoleCode.Administrator;
            roleCreate2.name = 'Role test 2';
            const role2 = await roleBusiness.createRole(roleCreate2);

            if (role2) {
                const roleUpdate = new RoleUpdate();
                roleUpdate.name = roleCreate2.name;

                await roleBusiness.updateRole(role.id, roleUpdate).catch(error => {
                    expect(error.httpCode).to.eq(400);
                });
            }
        }
    });

    it('Update role successfully', async () => {
        const roleCreate = generateRoleData();
        const role = await roleBusiness.createRole(roleCreate);

        if (role) {
            const roleUpdate = new RoleUpdate();
            roleUpdate.name = 'Role test updated';
            roleUpdate.level = role.level;

            const result = await roleBusiness.updateRole(role.id, roleUpdate);
            if (result) {
                const roleUpdated = await roleBusiness.getRole(role.id);
                expect(roleUpdated && roleUpdated.name === roleUpdate.name).to.eq(true);
            }
        }
    });

    it('Delete role without id', async () => {
        await roleBusiness.deleteRole(undefined as any).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Delete role with id invalid', async () => {
        await roleBusiness.deleteRole('1' as any).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Delete role with id not exists', async () => {
        await roleBusiness.deleteRole(100).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Delete role successfully', async () => {
        const roleCreate = generateRoleData();
        const role = await roleBusiness.createRole(roleCreate);

        if (role) {
            const result = await roleBusiness.deleteRole(role.id);
            expect(result).to.eq(true);
        }
    });

    it('Initial roles with data input invalid', async () => {
        await roleBusiness.initialRoles(undefined as any, true).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Initial roles successfull', async () => {
        const result = await roleBusiness.initialRoles(getRoles(), true);
        expect(result).to.eq(true);
    });
});
