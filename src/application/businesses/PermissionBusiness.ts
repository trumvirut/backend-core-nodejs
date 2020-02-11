import * as path from 'path';
import { Container, Service } from 'typedi';
import { Repository, getRepository } from 'typeorm';
import { Validator } from 'class-validator';
import { InjectRepository } from 'typeorm-typedi-extensions';
import DataAccess from '../dataAccess';
import IPermissionBusiness from './interfaces/IPermissionBusiness'; // eslint-disable-line
import Role from '../entities/Role';
import Permission from '../entities/Permission';
import ClaimView from '../models/permission/ClaimView';
import ClaimItem from '../models/permission/ClaimItem';
import PermissionView from '../models/permission/PermissionView';
import PermissionCreate from '../models/permission/PermissionCreate';
import { CommonError } from '../models/common/Error';
import DataHelper from '../../helpers/DataHelper';
import FileHelper from '../../helpers/FileHelper';
const validator = Container.get(Validator);

@Service()
export default class PermissionBusiness implements IPermissionBusiness {
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>;

    private claimPermissions: ClaimView[];

    async getClaimPermissions(): Promise<ClaimView[]> {
        if (this.claimPermissions && this.claimPermissions.length)
            return this.claimPermissions;

        this.claimPermissions = [];
        const dir = path.join(__dirname, '../../resources/permissions');
        const files = await FileHelper.getFiles(dir).then(files => files.map(file => dir + '/' + file));

        files.filter(file => !file.endsWith('.map')).forEach(file => {
            let name = path.basename(file, path.extname(file));
            name = name.substr(0, name.toLowerCase().lastIndexOf('claim'));

            const claimView = new ClaimView(name);
            this.claimPermissions.push(claimView);

            const claimObj = require(file).default;
            Object.keys(claimObj).forEach(name => {
                claimView.items.push(new ClaimItem({
                    code: claimObj[name],
                    name
                }));
            });
        });
        return this.claimPermissions;
    }

    async getPermission(id: number): Promise<PermissionView | undefined> {
        DataHelper.validateId(id);

        const permission = await this.permissionRepository.createQueryBuilder('permission')
            .innerJoinAndSelect('permission.role', 'role', 'role.deletedAt IS NULL')
            .whereInIds([id])
            .getOne();

        return permission && new PermissionView(permission);
    }

    async getPermissionsByRole(roleId: number): Promise<PermissionView[]> {
        DataHelper.validateId(roleId, 'role');

        const permissions = await this.permissionRepository.createQueryBuilder('permission')
            .innerJoinAndSelect('permission.role', 'role', 'role.deletedAt IS NULL')
            .where('role.id = :roleId', { roleId })
            .getMany();

        return PermissionView.parseArray(permissions);
    }

    async checkPermission(roleId: number, claims: number[]): Promise<boolean> {
        if (!roleId || !validator.isInt(roleId) || !claims || !claims.length || claims.find(claim => !validator.isInt(claim)))
            throw new CommonError();

        const permissions = await this.permissionRepository.createQueryBuilder('permission')
            .cache('permissions', 24 * 60 * 60 * 1000)
            .getMany();

        return !!permissions.find(permission => permission.roleId === roleId && claims.findIndex(claim => permission.claim === claim) !== -1);
    }

    async createPermission(data: PermissionCreate): Promise<PermissionView | undefined> {
        await DataHelper.validateDataModel(data);

        if (await this.checkPermission(data.roleId, [data.claim]))
            throw new CommonError(105, 'permission');

        const result = await this.permissionRepository.insert(data);

        let permission;
        if (result.raw && result.raw.length) {
            await DataAccess.removeCaching('permissions');
            permission = await this.getPermission(result.raw[0].id);
        }
        return permission;
    }

    async deletePermission(id: number): Promise<boolean> {
        DataHelper.validateId(id);

        const permission = await this.permissionRepository.createQueryBuilder('permission')
            .whereInIds([id])
            .getOne();

        if (!permission)
            throw new CommonError(104, 'permission');

        const result = await this.permissionRepository.delete(id);
        if (result.affected)
            await DataAccess.removeCaching('permissions');

        return !!result.affected;
    }

    async initialPermissions(data: {isRequired?: boolean, data: any}[], isRequired?: boolean): Promise<boolean> {
        if (!data || !Array.isArray(data))
            throw new CommonError();
        const roles = await getRepository(Role).createQueryBuilder('role').getMany();

        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            if (item.isRequired || isRequired) {
                const role = roles.find(role => role.code === item.data.roleCode);
                if (role) {
                    const result = await this.checkPermission(role.id, [item.data.claim]);
                    if (!result) {
                        const permissionCreate = new PermissionCreate();
                        permissionCreate.roleId = role.id;
                        permissionCreate.claim = item.data.claim;

                        await this.createPermission(permissionCreate);
                    }
                }
            }
        }
        return true;
    }
};
