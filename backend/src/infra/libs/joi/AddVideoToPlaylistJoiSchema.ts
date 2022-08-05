import Joi from 'joi';
import { validationMessages as messages } from '../../../domain/libs/ValidationMessages';

export const addVideoToPlaylistJoiSchema = Joi.object({
  id_authenticated_channel: Joi.string().empty().required().max(50),
  id_referenced_video: Joi.string().empty().required().max(50),
  id_playlist: Joi.string().empty().required().max(50)
}).messages({
  'string.empty': messages.empty,
  'any.required': messages.required,
  'string.base': messages.string,
  'string.max': 'Deve ter no máximo {#limit} caracteres.'
});
