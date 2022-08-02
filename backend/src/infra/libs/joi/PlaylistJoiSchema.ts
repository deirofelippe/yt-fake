import Joi from 'joi';
import { PlaylistVisibility } from '../../../domain/entities/Playlist';

export const playlistJoiSchema = Joi.object({
  id: Joi.string(),
  id_channel: Joi.string().required(),
  title: Joi.string().required(),
  price: Joi.number().min(0).default(0),
  visibility: Joi.string()
    .equal(PlaylistVisibility.PUBLIC, PlaylistVisibility.PRIVATE)
    .case('lower')
    .default(PlaylistVisibility.PUBLIC),
  description: Joi.string()
});
