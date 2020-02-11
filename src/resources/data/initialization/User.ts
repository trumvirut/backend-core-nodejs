import { Gender, RoleCode } from '../../../application/models/common/Enum';

/**
 * Get init user list
 * @returns {*} User list
 */
export default function getUsers(): {isRequired?: boolean, data: any}[] {
    return [
        { isRequired: true, data: { roleCode: RoleCode.Administrator, firstName: 'Administrator', lastName: '', email: 'admin@localhost.com', password: 'Backend-seed2', gender: Gender.Male } },
        { data: { roleCode: RoleCode.UserCommon, firstName: 'Turtle', lastName: '', email: 'turtle@localhost.com', password: 'Backend-seed2', gender: Gender.Male, avatar: '../../resources/images/turtle-icon.png' } },
        { data: { roleCode: RoleCode.UserCommon, firstName: 'Chicken', lastName: '', email: 'chicken@localhost.com', password: 'Backend-seed2', gender: Gender.Male, avatar: '../../resources/images/chicken-icon.png' } },
        { data: { roleCode: RoleCode.UserCommon, firstName: 'Crab', lastName: '', email: 'crab@localhost.com', password: 'Backend-seed2', gender: Gender.Male, avatar: '../../resources/images/crab-icon.png' } },
        { data: { roleCode: RoleCode.UserCommon, firstName: 'Frog', lastName: '', email: 'frog@localhost.com', password: 'Backend-seed2', gender: Gender.Male, avatar: '../../resources/images/frog-icon.png' } },
        { data: { roleCode: RoleCode.UserCommon, firstName: 'Mouse', lastName: '', email: 'mouse@localhost.com', password: 'Backend-seed2', gender: Gender.Male, avatar: '../../resources/images/mouse-icon.png' } },
        { data: { roleCode: RoleCode.UserCommon, firstName: 'Sheep', lastName: '', email: 'sheep@localhost.com', password: 'Backend-seed2', gender: Gender.Male, avatar: '../../resources/images/sheep-icon.png' } },
        { data: { roleCode: RoleCode.UserCommon, firstName: 'Dog', lastName: '', email: 'dog@localhost.com', password: 'Backend-seed2', gender: Gender.Male, avatar: '../../resources/images/dog-icon.png' } },
        { data: { roleCode: RoleCode.UserCommon, firstName: 'Bird', lastName: '', email: 'bird@localhost.com', password: 'Backend-seed2', gender: Gender.Male, avatar: '../../resources/images/bird-icon.png' } },
        { data: { roleCode: RoleCode.UserCommon, firstName: 'Shark', lastName: '', email: 'shark@localhost.com', password: 'Backend-seed2', gender: Gender.Male, avatar: '../../resources/images/shark-icon.png' } }
    ];
}
