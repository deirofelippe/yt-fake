import Joi from 'joi';
import { PlaylistVisibility } from '../../../domain/entities/Playlist';
import { validationMessages as message } from '../../../domain/libs/ValidationMessages';

export const createPlaylistJoiSchema = Joi.object({
  id_authenticated_channel: Joi.string().empty().required().max(50),
  title: Joi.string().empty().required().max(100),
  price: Joi.number().min(0).default(0),
  visibility: Joi.string()
    .equal(PlaylistVisibility.PUBLIC, PlaylistVisibility.PRIVATE)
    .required()
    .messages({
      'any.only': 'Deve ser "publico" ou "privado".'
    }),
  description: Joi.string()
}).messages({
  'any.required': message.required,
  'number.min': 'Deve ser maior que {#limit} ou {#limit}.',
  'string.empty': message.empty,
  'number.base': message.number,
  'string.base': message.string,
  'string.max': 'Deve ter no máximo {#limit} caracteres.'
});
