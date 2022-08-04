import Joi from 'joi';
import { PlaylistVisibility } from '../../../domain/entities/Playlist';

export const createPlaylistJoiSchema = Joi.object({
  id_authenticated_channel: Joi.string().required(),
  title: Joi.string().required(),
  price: Joi.number().min(0),
  visibility: Joi.string().equal(
    PlaylistVisibility.PUBLIC,
    PlaylistVisibility.PRIVATE
  ),
  description: Joi.string()
}).messages({
  'any.required': 'Não pode estar vazio',
  'number.min': 'Deve ser maior que {#limit} ou {#limit}',
  'any.only': 'Deve ser "publico" ou "privado"',
  'string.base': 'Deve conter letras'
});
