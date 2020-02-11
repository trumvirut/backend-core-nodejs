import { Container } from 'typedi';
import { Validator } from 'class-validator';
import { CommonError } from '../application/models/common/Error';
const validator = Container.get(Validator);

export default class DataHelper {
    static async validateModel(id: number, data: any): Promise<void> {
        DataHelper.validateId(id);
        await DataHelper.validateDataModel(data);
    }

    static validateId(id: number, fieldName: string = 'id'): void {
        if (!id)
            throw new CommonError(101, fieldName);
        if (!validator.isInt(id))
            throw new CommonError(102, fieldName);
    }
    static async validateDataModel(data: any): Promise<void> {                                          // eslint-disable-line
        if (!data)
            throw new CommonError();

        await validator.validate(data, { whitelist: true, forbidNonWhitelisted: true }).then(errors => {
            if (errors && errors.length) {
                const constraints = errors[0].constraints;
                const fields = Object.keys(constraints);

                if (fields.length) {
                    const message = constraints[Object.keys(constraints)[0]];
                    const error = new CommonError();
                    error.message = message.substr(0, 1).toUpperCase() + message.substr(1);
                    throw error;
                }
            }
        });
    }

    static filterDataInput<T>(entity: T, data: any, fields?: string[]): T {
        if (entity && typeof entity === 'object' && data && typeof data === 'object' && fields && Array.isArray(fields)) {
            for (let i = 0; i < fields.length; i++) {
                if (Object.prototype.isPrototypeOf.call(data, fields[i]) && data[fields[i]] !== undefined)
                    entity[fields[i]] = data[fields[i]];
            }
        }
        return entity;
    }

    static applyTemplate(template: string, ...params): string {
        return template.replace(/{(\d+)}/g, (match, number) => {
            return params[number] || match;
        });
    }

    static convertToCurrency(value: number, option): string {
        if (typeof value !== 'number')
            return '';

        if (!option)
            option = {};
        if (!option.format)
            option.format = 'en-US';
        if (!option.currency)
            option.currency = 'USD';

        return value.toLocaleString(option.format, { style: 'currency', currency: option.currency });
    }

    static convertStringToBoolean(val: string): boolean {
        if (!val)
            return false;
        val = val.toString();

        switch (val.toLowerCase().trim()) {
        case 'true': case 'yes': case '1': return true;
        case 'false': case 'no': case '0': return false;
        default: return false;
        }
    }
}
