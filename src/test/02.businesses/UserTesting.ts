import 'mocha';
import * as path from 'path';
import { expect } from 'chai';
import { Container } from 'typedi';
import DataAccess from '../../application/dataAccess';
import IRoleBusiness from '../../application/businesses/interfaces/IRoleBusiness';
import RoleBusiness from '../../application/businesses/RoleBusiness';
import IUserBusiness from '../../application/businesses/interfaces/IUserBusiness';
import UserBusiness from '../../application/businesses/UserBusiness';
import User from '../../application/entities/User';
import UserCreate from '../../application/models/user/UserCreate';
import UserUpdate from '../../application/models/user/UserUpdate';
import UserSignup from '../../application/models/user/UserSignup';
import UserSignin from '../../application/models/user/UserSignin';
import PasswordUpdate from '../../application/models/user/PasswordUpdate';
import { Gender } from '../../application/models/common/Enum';
import getRoles from '../../resources/data/initialization/Role';
import getUsers from '../../resources/data/initialization/User';
import FileHelper from '../../helpers/FileHelper';

let roleBusiness: IRoleBusiness;
let userBusiness: IUserBusiness;
let roleId: number;

const generateUserData = () => {
    const userCreate = new UserCreate();
    userCreate.roleId = roleId;
    userCreate.firstName = 'Test';
    userCreate.lastName = 'Local';
    userCreate.email = 'test@localhost.com';
    userCreate.password = 'Backend-seed2';
    userCreate.gender = Gender.Male;
    userCreate.birthday = new Date();
    userCreate.phone = '0123456789';
    userCreate.address = '123 Abc';
    userCreate.culture = 'en-US';
    userCreate.currency = 'USD';

    return userCreate;
};

describe('User testing', () => {
    before(async () => {
        await DataAccess.connection.synchronize(true);
        if (DataAccess.connection.queryResultCache)
            await DataAccess.connection.queryResultCache.clear();

        roleBusiness = Container.get(RoleBusiness);
        userBusiness = Container.get(UserBusiness);

        await roleBusiness.initialRoles(getRoles(), true);

        const data = await roleBusiness.findRoles('', 1, 1);
        if (data.results.length)
            roleId = data.results[0].id;
    });

    beforeEach(async () => {
        if (DataAccess.connection.queryResultCache)
            await DataAccess.connection.queryResultCache.clear();

        await DataAccess.connection.createQueryBuilder().delete().from(User).execute();
    });

    after(async () => {
        await DataAccess.connection.synchronize(true);
        if (DataAccess.connection.queryResultCache)
            await DataAccess.connection.queryResultCache.clear();
    });

    it('Find users without param', async () => {
        const userCreate = generateUserData();
        await userBusiness.createUser(userCreate);

        const { results, pagination } = await userBusiness.findUsers('', 0, 1);
        expect(Array.isArray(results) && results.length > 0 && pagination && pagination.total > 0).to.eq(true);
    });

    it('Find users with name or mail', async () => {
        const userCreate = generateUserData();
        await userBusiness.createUser(userCreate);

        const { results, pagination } = await userBusiness.findUsers('localhost', 0, 1);
        expect(Array.isArray(results) && results.length > 0 && pagination && pagination.total > 0).to.eq(true);
    });

    it('Get user by id without param', async () => {
        await userBusiness.getUser(undefined as any).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Get user by id invalid', async () => {
        await userBusiness.getUser('1' as any).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Get user by id', async () => {
        const userCreate = generateUserData();
        const user = await userBusiness.createUser(userCreate);

        if (user) {
            const result = await userBusiness.getUser(user.id);
            expect(result && result.id === user.id).to.eq(true);
        }
    });

    it('Get user profile by id without param', async () => {
        await userBusiness.getUserProfile(undefined as any).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Get user profile by id invalid', async () => {
        await userBusiness.getUserProfile('1' as any).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Get user profile by id', async () => {
        const userCreate = generateUserData();
        const user = await userBusiness.createUser(userCreate);

        if (user) {
            const userProfile = await userBusiness.getUserProfile(user.id);
            expect(userProfile && userProfile.email === user.email).to.eq(true);
        }
    });

    it('Get user by email without param', async () => {
        await userBusiness.getUserByEmail('').catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Get user by email invalid', async () => {
        await userBusiness.getUserByEmail('admin@').catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Get user by email', async () => {
        const userCreate = generateUserData();
        const user = await userBusiness.createUser(userCreate);

        if (user) {
            const userProfile = await userBusiness.getUserByEmail(user.email);
            expect(userProfile && userProfile.email === user.email).to.eq(true);
        }
    });

    it('Get user by token invalid', async () => {
        await userBusiness.getUserByToken('').catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Get user by token has expired', async () => {
        const userCreate = generateUserData();
        const user = await userBusiness.createUser(userCreate);

        if (user) {
            let userAuth1;
            const userSignin = new UserSignin();
            userSignin.email = 'test@localhost.com';
            userSignin.password = 'Backend-seed2';
            userSignin.expiredInMS = 10;

            const userAuth2 = await userBusiness.signin(userSignin);

            // Get user by token for caching in first time
            if (userAuth2 && userAuth2.accessToken && userAuth2.tokenExpire)
                await userBusiness.getUserByToken(userAuth2.accessToken);

            // Delay for expire user token
            await new Promise((resolve) => setTimeout(resolve, 12));

            // Get user with token has expired
            if (userAuth2 && userAuth2.accessToken && userAuth2.tokenExpire)
                userAuth1 = await userBusiness.getUserByToken(userAuth2.accessToken);
            expect(!userAuth1).to.eq(true);
        }
    });

    it('Get user by token', async () => {
        const userCreate = generateUserData();
        const user = await userBusiness.createUser(userCreate);

        if (user) {
            let userAuth1;
            const userSignin = new UserSignin();
            userSignin.email = 'test@localhost.com';
            userSignin.password = 'Backend-seed2';

            const userAuth2 = await userBusiness.signin(userSignin);
            if (userAuth2 && userAuth2.accessToken && userAuth2.tokenExpire)
                userAuth1 = await userBusiness.getUserByToken(userAuth2.accessToken);
            expect(!!userAuth1).to.eq(true);
        }
    });

    it('Signin without email', async () => {
        const userSignin = new UserSignin();
        userSignin.email = '';
        userSignin.password = 'Backend-seed2';

        await userBusiness.signin(userSignin).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Signin with email invalid', async () => {
        const userSignin = new UserSignin();
        userSignin.email = 'test@';
        userSignin.password = 'Backend-seed2';

        await userBusiness.signin(userSignin).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Signin without password', async () => {
        const userSignin = new UserSignin();
        userSignin.email = 'test@localhost.com';
        userSignin.password = '';

        await userBusiness.signin(userSignin).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Signin with wrong email or password', async () => {
        const userSignin = new UserSignin();
        userSignin.email = 'test@localhost.com';
        userSignin.password = '123abc';

        await userBusiness.signin(userSignin).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Signin successfully', async () => {
        const userCreate = generateUserData();
        const user = await userBusiness.createUser(userCreate);

        if (user) {
            const userSignin = new UserSignin();
            userSignin.email = 'test@localhost.com';
            userSignin.password = 'Backend-seed2';

            const userAuth = await userBusiness.signin(userSignin);
            expect(!!userAuth).to.eq(true);
        }
    });

    it('Signup with data invalid', async () => {
        await userBusiness.signup(undefined as any).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Signup without first name', async () => {
        const userSignup = new UserSignup();
        userSignup.firstName = '';
        userSignup.lastName = 'Local';
        userSignup.email = 'test@localhost.com';
        userSignup.password = 'Backend-seed2';

        await userBusiness.signup(userSignup).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Signup without email', async () => {
        const userSignup = new UserSignup();
        userSignup.firstName = 'Test';
        userSignup.lastName = 'Local';
        userSignup.email = '';
        userSignup.password = 'Backend-seed2';

        await userBusiness.signup(userSignup).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Signup without email invalid', async () => {
        const userSignup = new UserSignup();
        userSignup.firstName = 'Test';
        userSignup.lastName = 'Local';
        userSignup.email = 'test@';
        userSignup.password = 'Backend-seed2';

        await userBusiness.signup(userSignup).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Signup without password', async () => {
        const userSignup = new UserSignup();
        userSignup.firstName = 'Test';
        userSignup.lastName = 'Local';
        userSignup.email = 'test@localhost.com';
        userSignup.password = '';

        await userBusiness.signup(userSignup).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Signup with password length invalid', async () => {
        const userSignup = new UserSignup();
        userSignup.firstName = 'Test';
        userSignup.lastName = 'Local';
        userSignup.email = 'test@localhost.com';
        userSignup.password = '12345';

        await userBusiness.signup(userSignup).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Signup user with email has exists', async () => {
        const userSignup = new UserSignup();
        userSignup.firstName = 'Test';
        userSignup.lastName = 'Local';
        userSignup.email = 'test@localhost.com';
        userSignup.password = 'Backend-seed2';

        const userAuth = await userBusiness.signup(userSignup);
        if (userAuth) {
            await userBusiness.signup(userSignup).catch(error => {
                expect(error.httpCode).to.eq(400);
            });
        }
    });

    it('Signup successfully', async () => {
        const userSignup = new UserSignup();
        userSignup.firstName = 'Test';
        userSignup.lastName = 'Local';
        userSignup.email = 'test@localhost.com';
        userSignup.password = 'Backend-seed2';

        const userAuth = await userBusiness.signup(userSignup);
        expect(!!userAuth).to.eq(true);
    });

    it('Create user without param', async () => {
        await userBusiness.createUser(undefined as any).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Create user without role', async () => {
        const userCreate = generateUserData();
        userCreate.roleId = undefined as any;

        await userBusiness.createUser(userCreate).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Create user with gender invalid', async () => {
        const userCreate = generateUserData();
        userCreate.gender = 3;

        await userBusiness.createUser(userCreate).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Create user with birthday invalid', async () => {
        const userCreate = generateUserData();
        userCreate.birthday = 123 as any;

        await userBusiness.createUser(userCreate).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Create user with phone invalid', async () => {
        const userCreate = generateUserData();
        userCreate.phone = 'A912523524DS';

        await userBusiness.createUser(userCreate).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Create user with address invalid', async () => {
        const userCreate = generateUserData();
        userCreate.address = 'This is the address with length greater than 200 characters! This is the address with length greater than 200 characters! This is the address with length greater than 200 characters! This is the address with length greater than 200 characters!';

        await userBusiness.createUser(userCreate).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Create user with culture invalid', async () => {
        const userCreate = generateUserData();
        userCreate.culture = 'This is the address with length greater than 5 characters!';

        await userBusiness.createUser(userCreate).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Create user with currency invalid', async () => {
        const userCreate = generateUserData();
        userCreate.currency = 'USD2';

        await userBusiness.createUser(userCreate).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Create user successfully', async () => {
        const userCreate = generateUserData();
        const user = await userBusiness.createUser(userCreate);
        expect(!!user).to.eq(true);
    });

    it('Update user without id', async () => {
        await userBusiness.updateUser(undefined as any, undefined as any).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Update user with id invalid', async () => {
        await userBusiness.updateUser('1' as any, undefined as any).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Update user with data invalid', async () => {
        const { results } = await userBusiness.findUsers('', 0, 1);
        if (results && results.length) {
            await userBusiness.updateUser(results[0].id, undefined as any).catch(error => {
                expect(error.httpCode).to.eq(400);
            });
        }
    });

    it('Update user with id not exists', async () => {
        const { results } = await userBusiness.findUsers();
        if (results && results.length) {
            const userUpdate = results[0];
            await userBusiness.updateUser(1000000, userUpdate).catch(error => {
                expect(error.httpCode).to.eq(400);
            });
        }
    });

    it('Update user without first name', async () => {
        const { results } = await userBusiness.findUsers();
        if (results && results.length) {
            const user = results[0];
            const userUpdate = new UserUpdate();

            await userBusiness.updateUser(user.id, userUpdate).catch(error => {
                expect(error.httpCode).to.eq(400);
            });
        }
    });

    it('Update user with length first name invalid', async () => {
        const { results } = await userBusiness.findUsers('', 0, 1);
        if (results && results.length) {
            const user = results[0];
            const userUpdate = new UserUpdate();
            userUpdate.firstName = 'This is the length greater than 30 characters!';

            await userBusiness.updateUser(user.id, userUpdate).catch(error => {
                expect(error.httpCode).to.eq(400);
            });
        }
    });

    it('Update user with length last name invalid', async () => {
        const { results } = await userBusiness.findUsers('', 0, 1);
        if (results && results.length) {
            const user = results[0];
            const userUpdate = new UserUpdate();
            userUpdate.firstName = user.firstName;
            userUpdate.lastName = 'This is the length greater than 30 characters!';

            await userBusiness.updateUser(user.id, userUpdate).catch(error => {
                expect(error.httpCode).to.eq(400);
            });
        }
    });

    it('Update user successfully', async () => {
        const userCreate = generateUserData();
        const user = await userBusiness.createUser(userCreate);

        if (user) {
            const userUpdate = new UserUpdate();
            userUpdate.firstName = user.firstName;
            userUpdate.lastName = 'Test 123';

            const result = await userBusiness.updateUser(user.id, userUpdate);
            if (result) {
                const userUpdated = await userBusiness.getUser(user.id);
                expect(userUpdated && userUpdated.lastName === userUpdate.lastName).to.eq(true);
            }
        }
    });

    it('Update password without id', async () => {
        const userPassword = new PasswordUpdate();
        await userBusiness.updatePassword(undefined as any, userPassword).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Update password with id invalid', async () => {
        const userPassword = new PasswordUpdate();
        await userBusiness.updatePassword('1' as any, userPassword).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Update password with data invalid', async () => {
        const userPassword = new PasswordUpdate();
        await userBusiness.updatePassword(1, userPassword).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Update password with wrong old password', async () => {
        const userCreate = generateUserData();
        const user = await userBusiness.createUser(userCreate);

        if (user) {
            const userPassword = new PasswordUpdate();
            userPassword.password = '12345';
            userPassword.newPassword = 'Backend-seed2';

            await userBusiness.updatePassword(user.id, userPassword).catch(error => {
                expect(error.httpCode).to.eq(400);
            });
        }
    });

    it('Update password successfully', async () => {
        const userCreate = generateUserData();
        const user = await userBusiness.createUser(userCreate);

        if (user) {
            const userPassword = new PasswordUpdate();
            userPassword.password = 'Backend-seed2';
            userPassword.newPassword = 'Backend-seed2';

            const result = await userBusiness.updatePassword(user.id, userPassword);
            expect(result).to.eq(true);
        }
    });

    it('Upload avatar without id', async () => {
        await userBusiness.uploadUserAvatar(undefined as any, undefined as any).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Upload avatar with id invalid', async () => {
        await userBusiness.uploadUserAvatar('1' as any, undefined as any).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Upload avatar with data invalid', async () => {
        await userBusiness.uploadUserAvatar(1, undefined as any).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Upload avatar with format not supported', async () => {
        const filePath = path.join(__dirname, `../resources/images/workplace.tiff`);
        const buffer = await FileHelper.readFile(filePath);

        await userBusiness.uploadUserAvatar(1, buffer).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Upload avatar with id not exists', async () => {
        const filePath = path.join(__dirname, `../resources/images/workplace.jpg`);
        const buffer = await FileHelper.readFile(filePath);

        await userBusiness.uploadUserAvatar(1000, buffer).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Upload avatar with large size', async () => {
        const filePath = path.join(__dirname, `../resources/images/fog.jpg`);
        const buffer = await FileHelper.readFile(filePath);

        await userBusiness.uploadUserAvatar(1, buffer).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Upload avatar successfully', async () => {
        const filePath = path.join(__dirname, `../resources/images/workplace.jpg`);
        const buffer = await FileHelper.readFile(filePath);

        const userCreate = generateUserData();
        const user = await userBusiness.createUser(userCreate);

        if (user) {
            const result = await userBusiness.uploadUserAvatar(user.id, buffer);
            expect(!!result).to.eq(true);
        }
    });

    it('Delete user without id', async () => {
        await userBusiness.deleteUser(undefined as any).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Delete user with id invalid', async () => {
        await userBusiness.deleteUser('1' as any).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Delete user with id not exists', async () => {
        await userBusiness.deleteUser(1000).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Delete user successfully', async () => {
        const userCreate = generateUserData();
        const user = await userBusiness.createUser(userCreate);

        if (user) {
            const result = await userBusiness.deleteUser(user.id);
            expect(result).to.eq(true);
        }
    });

    it('Initial users with data input invalid', async () => {
        await userBusiness.initialUsers(undefined as any, true).catch(error => {
            expect(error.httpCode).to.eq(400);
        });
    });

    it('Initial users successfull', async () => {
        const initUsers = getUsers();
        const result = await userBusiness.initialUsers(initUsers, true);
        expect(result).to.eq(true);
    });
});
