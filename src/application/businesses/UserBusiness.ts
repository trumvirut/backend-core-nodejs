import * as path from 'path';
import * as crypto from 'crypto';
import { Container, Inject, Service } from 'typedi';
import { Brackets, Repository, getRepository } from 'typeorm';
import { Validator } from 'class-validator';
import { InjectRepository } from 'typeorm-typedi-extensions';
import DataAccess from '../dataAccess';
import IUserBusiness from './interfaces/IUserBusiness'; // eslint-disable-line
import IRoleBusiness from './interfaces/IRoleBusiness';
import RoleBusiness from './RoleBusiness';
import Role from '../entities/Role';
import User from '../entities/User';
import UserView from '../models/user/UserView';
import UserProfile from '../models/user/UserProfile';
import UserAuthentication from '../models/user/UserAuthentication';
import UserCreate from '../models/user/UserCreate';
import UserUpdate from '../models/user/UserUpdate';
import UserSignup from '../models/user/UserSignup';
import UserSignin from '../models/user/UserSignin';
import PasswordUpdate from '../models/user/PasswordUpdate';
import { RoleCode } from '../models/common/Enum';
import { CommonError } from '../models/common/Error';
import ResultList from '../models/common/ResultList';
import DateHelper from '../../helpers/DateHelper';
import FileHelper from '../../helpers/FileHelper';
import DataHelper from '../../helpers/DataHelper';
const fileType = require('file-type');
const validator = Container.get(Validator);

@Service()
export default class UserBusiness implements IUserBusiness {
    @InjectRepository(User)
    private userRepository: Repository<User>;

    @Inject(() => RoleBusiness)
    private roleBusiness: IRoleBusiness;

    async findUsers(keyword?: string, skip?: number, limit?: number): Promise<ResultList<UserView>> {
        const resultList = new ResultList<UserView>(skip, limit);
        let query = this.userRepository.createQueryBuilder('user')
            .innerJoinAndSelect('user.role', 'role', 'role.deletedAt IS NULL')
            .where('user.deletedAt IS NULL')
            .andWhere('role.code > :code', { code: RoleCode.Administrator });

        if (keyword && keyword.trim()) {
            keyword = `%${keyword.trim()}%`;
            query = query.andWhere(new Brackets(qb => {
                qb.where(`user.firstName || ' ' || user.lastName ILIKE :keyword`, { keyword })
                    .orWhere(`user.email ILIKE :keyword`, { keyword });
            }));
        }
        const [users, count] = await query
            .skip(resultList.pagination.skip)
            .take(resultList.pagination.limit)
            .getManyAndCount();

        resultList.results = UserView.parseArray(users);
        resultList.pagination.total = count;
        return resultList;
    }

    async getUser(id: number): Promise<UserView | undefined> {
        DataHelper.validateId(id);

        const user = await this.userRepository.createQueryBuilder('user')
            .innerJoinAndSelect('user.role', 'role', 'role.deletedAt IS NULL')
            .where('user.deletedAt IS NULL')
            .andWhereInIds([id])
            .getOne();

        return user && new UserView(user);
    }

    async getUserProfile(id: number): Promise<UserProfile | undefined> {
        DataHelper.validateId(id);

        const user = await this.userRepository.createQueryBuilder('user')
            .innerJoinAndSelect('user.role', 'role', 'role.deletedAt IS NULL')
            .where('user.deletedAt IS NULL')
            .andWhereInIds([id])
            .getOne();

        return user && new UserProfile(user);
    }

    async getUserByEmail(email: string): Promise<UserView | undefined> {
        if (!email)
            throw new CommonError(101, 'email');
        if (!validator.isEmail(email))
            throw new CommonError(102, 'email');

        const user = await this.userRepository.createQueryBuilder('user')
            .innerJoinAndSelect('user.role', 'role', 'role.deletedAt IS NULL')
            .where('user.deletedAt IS NULL')
            .andWhere('LOWER(user.email) = LOWER(:email)', { email })
            .getOne();

        return user && new UserView(user);
    }

    async getUserByToken(token: string): Promise<UserView | undefined> {
        if (!token)
            throw new CommonError();

        const user = await this.userRepository.createQueryBuilder('user')
            .innerJoinAndSelect('user.role', 'role', 'role.deletedAt IS NULL')
            .where('user.deletedAt IS NULL')
            .andWhere('user.accessToken = :token', { token })
            .andWhere('user.tokenExpire >= NOW()')
            .cache(token, 10 * 60 * 1000)
            .getOne();

        if (user && (!user.tokenExpire || new Date(user.tokenExpire) < new Date())) {
            await DataAccess.removeCaching(token);
            return undefined;
        }
        return user && new UserView(user);
    }

    async signin(data: UserSignin): Promise<UserAuthentication> {
        await DataHelper.validateDataModel(data);

        const user = await this.userRepository.createQueryBuilder('user')
            .innerJoinAndSelect('user.role', 'role', 'role.deletedAt IS NULL')
            .where('user.deletedAt IS NULL')
            .andWhere('LOWER(user.email) = LOWER(:email)', { email: data.email })
            .andWhere('user.password = :password', { password: this.hashPassword(data.password) })
            .getOne();

        if (!user)
            throw new CommonError(103, 'email address or password');

        if (data.expiredInMS === undefined)
            data.expiredInMS = 15 * 24 * 60 * 60 * 1000; // 15 days

        if (!user.accessToken || !user.tokenExpire || user.tokenExpire < new Date()) {
            const accessToken = crypto.randomBytes(64).toString('hex').substr(0, 64);
            const tokenExpire = DateHelper.addMiliseconds(new Date(), data.expiredInMS);

            user.accessToken = accessToken;
            user.tokenExpire = tokenExpire;
            await this.userRepository.update(user.id, { accessToken, tokenExpire });
        }
        return new UserAuthentication(user);
    }

    async signup(data: UserSignup): Promise<UserAuthentication | undefined> {
        await DataHelper.validateDataModel(data);

        const role = await this.roleBusiness.getRoleByCode(RoleCode.UserCommon);
        if (!role) throw new CommonError(104, 'role');

        const userCreate = new UserCreate();
        userCreate.roleId = role.id;
        userCreate.firstName = data.firstName;
        userCreate.lastName = data.lastName;
        userCreate.email = data.email;
        userCreate.password = data.password;

        const user = await this.createUser(userCreate);
        if (!user) throw new CommonError(3);

        const userSignin = new UserSignin();
        userSignin.email = data.email;
        userSignin.password = data.password;

        return await this.signin(userSignin);
    }

    async createUser(data: UserCreate): Promise<UserView | undefined> {
        await DataHelper.validateDataModel(data);
        this.validatePassword(data.password);
        data.password = this.hashPassword(data.password);

        const userExists = await this.userRepository.createQueryBuilder('user')
            .where('LOWER(user.email) = LOWER(:email)', { email: data.email })
            .getOne();

        if (userExists)
            throw new CommonError(105, 'email');

        const role = await this.roleBusiness.getRole(data.roleId);
        if (!role)
            throw new CommonError(102, 'role');

        const result = await this.userRepository.insert(data);

        let user;
        if (result.raw && result.raw.length)
            user = await this.getUser(result.raw[0].id);
        return user;
    }

    async updateUser(id: number, data: UserUpdate): Promise<boolean> {
        await DataHelper.validateModel(id, data);

        const user = await this.userRepository.createQueryBuilder('user')
            .whereInIds([id])
            .andWhere('user.deletedAt IS NULL')
            .getOne();

        if (!user)
            throw new CommonError(104, 'user');

        await this.userRepository.update(id, data);
        return true;
    }

    async updatePassword(id: number, data: PasswordUpdate): Promise<boolean> {
        await DataHelper.validateModel(id, data);

        this.validatePassword(data.newPassword);
        const user = await this.userRepository.createQueryBuilder('user')
            .whereInIds([id])
            .andWhere('user.deletedAt IS NULL')
            .andWhere('user.password = :password', { password: this.hashPassword(data.password) })
            .getOne();

        if (!user)
            throw new CommonError(104, 'user');

        await this.userRepository.update(id, { password: this.hashPassword(data.newPassword) });
        return true;
    }

    async uploadUserAvatar(id: number, buffer: Buffer): Promise<string> {
        DataHelper.validateId(id);
        if (!buffer)
            throw new CommonError();

        const type = fileType(buffer);
        if (!type || !(process.env.UPLOAD_IMAGE_FORMATS || '').toLowerCase().split('|').includes(type.ext))
            throw new CommonError(205, 'image', 'JPEG (.jpeg/.jpg), GIF (.gif), PNG (.png)');

        if (buffer.length > Number(process.env.UPLOAD_IMAGE_SIZE_LIMIT))
            throw new CommonError(304, 'image', Number(process.env.UPLOAD_IMAGE_SIZE_LIMIT) / 1024, 'KB');

        const user = await this.userRepository.createQueryBuilder('user')
            .whereInIds([id])
            .andWhere('user.deletedAt IS NULL')
            .getOne();
        if (!user)
            throw new CommonError(104, 'user');

        const avatar = `/uploads/images/${id}/avatar.${type.ext}`;

        await DataAccess.executeTransaction(async (queryRunner) => {
            await queryRunner.manager.getRepository(User).update(id, { avatar });

            const filePath = path.join(__dirname, `../../..${avatar}`);
            await FileHelper.writeFile(filePath, buffer);
        });
        return avatar;
    }

    async deleteUser(id: number): Promise<boolean> {
        DataHelper.validateId(id);

        const user = await this.userRepository.createQueryBuilder('user')
            .whereInIds([id])
            .andWhere('user.deletedAt IS NULL')
            .getOne();

        if (!user)
            throw new CommonError(104, 'user');

        await this.userRepository.update(id, { deletedAt: new Date() });
        return true;
    }

    async initialUsers(data: { isRequired?: boolean, data: any }[], isRequired?: boolean): Promise<boolean> {
        if (!data || !Array.isArray(data))
            throw new CommonError();
        const roles = await getRepository(Role).createQueryBuilder('role').getMany();

        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            if (item.isRequired || isRequired) {
                const role = roles.find(role => role.code === item.data.roleCode);
                if (role) {
                    const user = await this.getUserByEmail(item.data.email);
                    if (!user) {
                        const userCreate = new UserCreate();
                        userCreate.roleId = role.id;
                        userCreate.firstName = item.data.firstName;
                        userCreate.lastName = item.data.lastName;
                        userCreate.email = item.data.email;
                        userCreate.password = item.data.password;
                        userCreate.gender = item.data.gender;
                        userCreate.birthday = item.data.birthday;
                        userCreate.phone = item.data.phone;
                        userCreate.address = item.data.address;
                        userCreate.culture = item.data.culture;
                        userCreate.currency = item.data.currency;

                        const result = await this.createUser(userCreate);

                        if (result && item.data.avatar) {
                            const filePath = path.join(__dirname, item.data.avatar);
                            const file = await FileHelper.readFile(filePath);
                            await this.uploadUserAvatar(result.id, file);
                        }
                    }
                }
            }
        }
        return true;
    }

    private validatePassword(password: string) {
        const regExp = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*()-_=+[{\]}\\|;:'",<.>/?]).{6,20}/;
        if (!regExp.test(password))
            throw new CommonError(401, 'password', 6, 20, 'with one uppercase letter, one lower case letter, one digit and one special character');
    }

    private hashPassword(password: string): string {
        return password ? crypto.createHash('md5').update('$$' + password).digest('hex') : '';
    }
};
