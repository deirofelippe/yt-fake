import Joi from 'joi';
import { VideoVisibility } from '../../../domain/entities/Video';

export const videoJoiSchema = Joi.object({
  id: Joi.string().max(60),
  id_channel: Joi.string().max(60).required(),
  title: Joi.string().max(80).required(),
  video: Joi.string().max(255).required(),
  thumbnail: Joi.string().max(255),
  price: Joi.number().min(0).default(0),
  visibility: Joi.string()
    .equal(VideoVisibility.PUBLIC, VideoVisibility.PRIVATE)
    .case('lower')
    .default(VideoVisibility.PUBLIC),
  description: Joi.string(),
  likes: Joi.number().default(0).integer().min(0),
  dislikes: Joi.number().default(0).integer().min(0),
  views: Joi.number().default(0).integer().min(0)
});
