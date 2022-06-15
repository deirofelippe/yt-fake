import Joi from 'joi';
import { Validator } from '../../../domain/libs/Validator';

export class JoiValidator implements Validator {
  constructor(private schema: Joi.Schema) {}

  execute(object: any): void {
    Joi.assert(object, this.schema, { abortEarly: false });
  }
}
