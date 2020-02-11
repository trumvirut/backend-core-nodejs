import { RoleCode } from '../../../application/models/common/Enum';

/**
 * Get init role list
 * @returns {*} Role list
 */
export default function getRoles(): {isRequired?: boolean, data: any}[] {
    return [
        { isRequired: true, data: { code: RoleCode.Administrator, name: 'Administrator', level: 1 } },
        { data: { code: RoleCode.UserCommon, name: 'User Common', level: 2 } }
    ];
}
