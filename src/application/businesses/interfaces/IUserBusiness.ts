import UserView from '../../models/user/UserView';
import UserProfile from '../../models/user/UserProfile'; // eslint-disable-line
import UserAuthentication from '../../models/user/UserAuthentication';
import UserCreate from '../../models/user/UserCreate';
import UserUpdate from '../../models/user/UserUpdate';
import UserSignup from '../../models/user/UserSignup';
import UserSignin from '../../models/user/UserSignin';
import PasswordUpdate from '../../models/user/PasswordUpdate';
import ResultList from '../../models/common/ResultList';

interface IUserBusiness {
    /**
     * Find users with pagination.
     * @param keyword name or email of user.
     */
    findUsers(keyword?: string, skip?: number, limit?: number): Promise<ResultList<UserView>>;

    getUser(id: number): Promise<UserView | undefined>;

    /**
     * Get user with information limited.
     */
    getUserProfile(id: number): Promise<UserProfile | undefined>;

    getUserByEmail(email: string): Promise<UserView | undefined>;

    /**
     * Use to authenticate user.
     * @param token Access token
     */
    getUserByToken(token: string): Promise<UserView | undefined>;

    signin(data: UserSignin): Promise<UserAuthentication>;

    signup(data: UserSignup): Promise<UserAuthentication | undefined>;

    createUser(data: UserCreate): Promise<UserView | undefined>;

    updateUser(id: number, data: UserUpdate): Promise<boolean>;

    updatePassword(id: number, data: PasswordUpdate): Promise<boolean>;

    uploadUserAvatar(id: number, buffer: Buffer): Promise<string>;

    deleteUser(id: number): Promise<boolean>;

    initialUsers(data: {isRequired?: boolean, data: any}[], isRequired?: boolean): Promise<boolean>;
}

export default IUserBusiness;
