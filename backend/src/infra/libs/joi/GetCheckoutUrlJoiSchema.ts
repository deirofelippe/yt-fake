import Joi from 'joi';
import { validationMessages as message } from '../../../domain/libs/ValidationMessages';
import { ItemType } from '../../../domain/usecases/GetCheckoutUrlUsecase';

export const getCheckoutUrlJoiSchema = Joi.object({
  id_authenticated_channel: Joi.string().empty().required().max(50),
  items: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().empty().required().max(50),
        type: Joi.string()
          .equal(ItemType.VIDEO, ItemType.PLAYLIST)
          .required()
          .messages({ 'any.only': 'Deve ser "video" ou "playlist".' })
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'Deve ter no mínimo {#limit} item no cart.',
      'array.base': 'Deve ser uma lista de itens.'
    })
}).messages({
  'any.required': message.required,
  'string.empty': message.empty,
  'string.base': message.string,
  'string.max': 'Deve ter no máximo {#limit} caracteres.'
});
