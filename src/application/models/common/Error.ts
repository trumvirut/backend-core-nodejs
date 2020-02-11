import { HttpError } from 'routing-controllers';
import MessageError from '../../../resources/data/MessageError';
import DataHelper from '../../../helpers/DataHelper';

export class CommonError extends HttpError {
    constructor(code: number = 1, ...params) {
        super(400);

        if (!code)
            this.message = MessageError.ERR_001;
        else {
            this.message = MessageError['ERR_' + code.toString().padStart(3, '0')];
            if (params && params.length)
                this.message = DataHelper.applyTemplate(this.message, ...params);
        }
        Object.setPrototypeOf(this, CommonError.prototype);
    }
};
