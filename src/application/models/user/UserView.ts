import User from '../../entities/User';
import RoleReference from '../role/RoleReference';
import { Gender } from '../common/Enum';

export default class UserView {
    id: number;
    role: RoleReference;
    firstName: string;
    lastName?: string;
    email: string;
    avatar?: string;
    gender?: Gender;
    birthday?: Date;
    phone?: string;
    address?: string;
    culture?: string;
    currency?: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: User) {
        this.id = data.id;
        this.role = new RoleReference(data.role);
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.email = data.email;
        this.avatar = data.avatar;
        this.gender = data.gender;
        this.birthday = data.birthday;
        this.phone = data.phone;
        this.address = data.address;
        this.culture = data.culture;
        this.currency = data.currency;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    static parseArray(list: User[]): UserView[] {
        return list && Array.isArray(list) ? list.map(item => new UserView(item)) : [];
    }
};
