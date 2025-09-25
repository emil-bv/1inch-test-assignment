import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsPositiveNumberString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPositiveNumberString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          const regex = /^\d+(\.\d+)?$/;
          if (!regex.test(value)) return false;
          const num = parseFloat(value);
          return num > 0;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a positive number string`;
        },
      },
    });
  };
}
