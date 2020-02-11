import User from '../../entities/User';

export default class UserReference {
    id: number;
    firstName: string;
    lastName?: string;
    email: string;
    avatar?: string;

    constructor(data: User) {
        this.id = data.id;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.email = data.email;
        this.avatar = data.avatar;
    }
};
