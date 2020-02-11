import User from '../../entities/User';
import { Gender } from '../common/Enum';

export default class UserProfile {
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

    constructor(data: User) {
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
    }
};
