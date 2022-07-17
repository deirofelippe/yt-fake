import Joi, { ValidationErrorItem, ValidationError } from 'joi';
import { Validator } from '../../../domain/libs/Validator';
import {
  FieldError,
  FieldsValidationError
} from '../../../errors/FieldsValidationError';

export class JoiValidator implements Validator {
  constructor(private schema: Joi.Schema) {}

  public execute(object: any): void {
    try {
      Joi.assert(object, this.schema, { abortEarly: false });
    } catch (error) {
      if (error instanceof ValidationError) {
        const errorMessage = this.formatError(error.details);
        throw new FieldsValidationError(errorMessage);
      }
      throw error;
    }
  }

  private formatError(errors: ValidationErrorItem[]): FieldError[] {
    return errors.map((error) => ({
      field: error.context.label,
      message: error.message
    }));
  }
}
