import { PlaylistType, PlaylistVisibility } from '../entities/Playlist';

export type PlaylistDTO = {
  id: string;
  id_channel: string;
  title: string;
  type: PlaylistType;
  visibility: PlaylistVisibility;
  description?: string;
};
