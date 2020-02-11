import { ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator';

/**
 * Checks if the value is date or date string
 */
export function IsDateAndParse(validationOptions?: ValidationOptions) {
    return function(object: Object, propertyName: string) {
        registerDecorator({
            name: 'isDateAndParse',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (value instanceof Date)
                        return true;
                    if (typeof value === 'number' || !isNaN(Date.parse(value))) {
                        args.object[propertyName] = new Date(value);
                        return true;
                    }
                    return false;
                },
                defaultMessage(args: ValidationArguments) {
                    return propertyName + ' must be a number or Date';
                }
            }
        });
    };
}
