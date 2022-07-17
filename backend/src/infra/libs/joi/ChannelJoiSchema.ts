import Joi from 'joi';

export const channelJoiSchema = Joi.object({
  id: Joi.string(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  description: Joi.string(),
  avatar: Joi.string(),
  address: Joi.object({
    zip_code: Joi.string().required(),
    number: Joi.number().required(),
    country: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required()
  })
});
