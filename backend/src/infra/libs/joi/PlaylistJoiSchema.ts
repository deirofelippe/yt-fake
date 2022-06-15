import Joi from 'joi';
import {
  PlaylistType,
  PlaylistVisibility
} from '../../../domain/entities/Playlist';

export const playlistJoiSchema = Joi.object({
  id: Joi.string().uuid(),
  id_channel: Joi.string().uuid().required(),
  title: Joi.string().required(),
  type: Joi.string()
    .equal(PlaylistType.REGULAR, PlaylistType.BUYABLE)
    .case('lower'),
  visibility: Joi.string()
    .equal(PlaylistVisibility.PUBLIC, PlaylistVisibility.PRIVATE)
    .case('lower'),
  description: Joi.string()
});
