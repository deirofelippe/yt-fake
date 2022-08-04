import { Playlist, PlaylistAttributes } from '../entities/Playlist';
import { VideoInPlaylistAttributes } from '../usecases/AddVideoToPlaylistUsecase';

export interface PlaylistRepositoryInterface {
  findAll(): Promise<Playlist[] | []>;
  findById(id: string): Promise<Playlist | undefined>;
  create(playlist: PlaylistAttributes): Promise<void>;
  addVideo(videoInPlaylist: VideoInPlaylistAttributes): Promise<void>;
  findPlaylistsByIds(ids: string): Promise<Playlist[] | []>;
}
