import { PlaylistAttributes } from '../entities/Playlist';
import { VideoInPlaylistAttributes } from '../entities/VideoInPlaylist';

export interface PlaylistRepositoryInterface {
  findAll(): Promise<PlaylistAttributes[] | []>;
  findById(id: string): Promise<PlaylistAttributes | undefined>;
  create(playlist: PlaylistAttributes): Promise<void>;
  addVideo(videoInPlaylist: VideoInPlaylistAttributes): Promise<void>;
  findPlaylistsByIds(ids: string): Promise<PlaylistAttributes[] | []>;
}
