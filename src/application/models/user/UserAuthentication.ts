import User from '../../entities/User';
import RoleReference from '../role/RoleReference';
import UserProfile from './UserProfile';

export default class UserAuthentication {
    id: number;
    role: RoleReference;
    profile: UserProfile;
    accessToken?: string;
    tokenExpire?: Date;

    constructor(data: User) {
        this.id = data.id;
        this.role = new RoleReference(data.role);
        this.profile = new UserProfile(data);
        this.accessToken = data.accessToken;
        this.tokenExpire = data.tokenExpire;
    }
};
