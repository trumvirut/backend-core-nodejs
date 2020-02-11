import { Container, Service } from 'typedi';
import { Repository } from 'typeorm';
import { Validator } from 'class-validator';
import { InjectRepository } from 'typeorm-typedi-extensions';
import IRoleBusiness from './interfaces/IRoleBusiness'; // eslint-disable-line
import Role from '../entities/Role';
import RoleView from '../models/role/RoleView';
import RoleLookup from '../models/role/RoleLookup';
import RoleCreate from '../models/role/RoleCreate';
import RoleUpdate from '../models/role/RoleUpdate';
import ResultList from '../models/common/ResultList';
import { CommonError } from '../models/common/Error';
import DataHelper from '../../helpers/DataHelper';
const validator = Container.get(Validator);

@Service()
export default class RoleBusiness implements IRoleBusiness {
    @InjectRepository(Role)
    private roleRepository: Repository<Role>;

    async findRoles(keyword?: string, skip?: number, limit?: number): Promise<ResultList<RoleView>> {
        const resultList = new ResultList<RoleView>(skip, limit);
        let query = this.roleRepository.createQueryBuilder('role')
            .where('role.deletedAt IS NULL');

        if (keyword && keyword.trim()) {
            keyword = `%${keyword.trim()}%`;
            query = query.andWhere('role.name ilike :keyword', { keyword });
        }
        const [roles, count] = await query
            .orderBy({
                'role.level': 'ASC',
                'role.name': 'ASC'
            })
            .skip(resultList.pagination.skip)
            .take(resultList.pagination.limit)
            .getManyAndCount();

        resultList.results = RoleView.parseArray(roles);
        resultList.pagination.total = count;
        return resultList;
    }

    async lookupRoles(keyword?: string, skip?: number, limit?: number): Promise<ResultList<RoleLookup>> {
        const resultList = new ResultList<RoleLookup>(skip, limit);
        let query = this.roleRepository.createQueryBuilder('role')
            .where('role.deletedAt IS NULL');

        if (keyword && keyword.trim()) {
            keyword = `%${keyword.trim()}%`;
            query = query.andWhere('role.name ilike :keyword', { keyword });
        }
        const [roles, count] = await query
            .orderBy({
                'role.level': 'ASC',
                'role.name': 'ASC'
            })
            .skip(resultList.pagination.skip)
            .take(resultList.pagination.limit)
            .getManyAndCount();

        resultList.results = RoleLookup.parseArray(roles);
        resultList.pagination.total = count;
        return resultList;
    }

    async getRole(id: number): Promise<RoleView | undefined> {
        DataHelper.validateId(id);

        const role = await this.roleRepository.createQueryBuilder('role')
            .whereInIds([id])
            .andWhere('role.deletedAt IS NULL')
            .getOne();

        return role && new RoleView(role);
    }

    async getRoleByCode(code: number): Promise<RoleView | undefined> {
        if (!code)
            throw new CommonError(101, 'code');
        if (!validator.isInt(code))
            throw new CommonError(102, 'code');

        const role = await this.roleRepository.createQueryBuilder('role')
            .where('role.code = :code', { code })
            .andWhere('role.deletedAt IS NULL')
            .getOne();

        return role && new RoleView(role);
    }

    private async getRoleByName(name: string, excludeId?: number): Promise<RoleView | undefined> {
        if (!name)
            throw new CommonError(101, 'name');

        let query = this.roleRepository.createQueryBuilder('role')
            .where('lower(role.name) = :name', { name: name.trim().toLowerCase() })
            .andWhere('role.deletedAt IS NULL');

        if (excludeId)
            query = query.andWhere('role.id != :id', { id: excludeId });

        const role = await query.getOne();
        return role && new RoleView(role);
    }

    async createRole(data: RoleCreate): Promise<RoleView | undefined> {
        await DataHelper.validateDataModel(data);

        if (await this.getRoleByCode(data.code))
            throw new CommonError(105, 'code');

        const roleExists = await this.getRoleByName(data.name);
        if (roleExists)
            throw new CommonError(105, 'name');

        const result = await this.roleRepository.insert(data);

        let role;
        if (result.raw && result.raw.length)
            role = await this.getRole(result.raw[0].id);
        return role;
    }

    async updateRole(id: number, data: RoleUpdate): Promise<boolean> {
        await DataHelper.validateModel(id, data);

        const role = await this.roleRepository.createQueryBuilder('role')
            .whereInIds([id])
            .andWhere('role.deletedAt IS NULL')
            .getOne();

        if (!role)
            throw new CommonError(104, 'role');

        const roleExists = await this.getRoleByName(data.name, id);
        if (roleExists)
            throw new CommonError(105, 'name');

        await this.roleRepository.update(id, data);
        return true;
    }

    async deleteRole(id: number): Promise<boolean> {
        DataHelper.validateId(id);

        const role = await this.roleRepository.createQueryBuilder('role')
            .whereInIds([id])
            .andWhere('role.deletedAt IS NULL')
            .getOne();

        if (!role)
            throw new CommonError(104, 'role');

        await this.roleRepository.update(id, { deletedAt: new Date() });
        return true;
    }

    async initialRoles(list: {isRequired?: boolean, data: any}[], isRequired?: boolean): Promise<boolean> {
        if (!list || !Array.isArray(list))
            throw new CommonError();

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            if (item.isRequired || isRequired) {
                const role = await this.getRoleByCode(item.data.code);
                if (!role) {
                    const roleCreate = new RoleCreate();
                    roleCreate.code = item.data.code;
                    roleCreate.name = item.data.name;
                    roleCreate.level = item.data.level;

                    await this.createRole(roleCreate);
                }
            }
        }
        return true;
    }
};
