import Joi from 'joi';

export const videoInPlaylistJoiSchema = Joi.object({
  id: Joi.string(),
  id_referenced_video: Joi.string().empty().alphanum().length(3).messages({
    'string.empty': 'Deve ser preenchido',
    'string.length': 'Deve ter 3 caracteres',
    'string.alphanum':
      'Não deve ter caracteres especiais, somente letras e números'
  }),
  id_playlist: Joi.string()
    .empty()
    .messages({ 'string.empty': 'Campo deve ser preenchido' })
});
